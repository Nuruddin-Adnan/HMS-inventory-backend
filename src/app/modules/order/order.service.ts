import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IOrder } from './order.interface';
import { orderSearchableFields } from './order.constant';
import { Order } from './order.model';
import { generateORDERID } from '../../../helpers/genereteID';
import { IPayment } from '../payment/payment.interface';
import { Payment } from '../payment/payment.model';
import { IOrderItem } from '../order-item/orderItem.interface';
import { Stock } from '../stock/stock.model';
import { OrderItem } from '../order-item/orderItem.model';
import generatePipeline from '../../../shared/generatePipeline';
import { Aggregate } from 'mongoose';

const createOrder = async (
  payload: IOrder,
  items: IOrderItem[],
  payment: Partial<IPayment>,
): Promise<IOrder> => {
  // ORDERID generate
  payload.BILLID = (await generateORDERID()) as string;

  // payment.data
  payment.paymentType = 'new';
  payment.sell = payload.BILLID;

  // check stock of the ordered product
  for (const item of items) {
    const stockItem = await Stock.findOne({ product: item.product }).select(
      'quantity productName',
    );

    if (!stockItem) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Product with ID ${item.product} not found in stock`,
      );
    }

    if (stockItem.quantity < item.quantity) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Insufficient stock for ${stockItem.productName}`,
      );
    }
  }

  // Update the stock quantity
  for (const item of items) {
    const stockItem = await Stock.findOne({ product: item.product }).select(
      'quantity totalSell',
    );

    if (!stockItem) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Product with ID ${item.product} not found in stock`,
      );
    }

    stockItem.quantity -= item.quantity; //update the stock quantity
    stockItem.totalSell += item.quantity; // update the total sell quantity
    await stockItem.save();
  }

  // insert the item into order items collection
  // Add createdBy field to each item
  const itemsWithCreatedBy = items.map(item => ({
    ...item,
    createdBy: payload.createdBy,
    BILLID: payload.BILLID,
  }));

  await OrderItem.insertMany(itemsWithCreatedBy);

  const result = await Order.create(payload);

  // create payment
  if (payload.received > 0) {
    await Payment.create(payment);
  }

  return result;
};

const getAllOrders = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IOrder[]>> => {
  const conditions = searcher(filters, orderSearchableFields);

  const { limit = 0, skip, fields, sort, nestedFilter } = queries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPipeline: any[] = [
    {
      $lookup: {
        from: 'customers',
        localField: 'CUSID',
        foreignField: 'CUSID',
        pipeline: [
          {
            $project: {
              name: 1,
              contactNo: 1,
              email: 1,
            },
          },
        ],
        as: 'customer',
      },
    },
  ];

  const pipeline = generatePipeline(
    initialPipeline,
    conditions,
    skip,
    fields,
    sort,
    limit,
    nestedFilter,
  );

  const aggregationPipeline: Aggregate<IOrder[]> = Order.aggregate(pipeline);

  const [result, total] = await Promise.all([
    aggregationPipeline.exec(),
    Order.aggregate([{ $match: conditions }, { $count: 'total' }]),
  ]);

  const page = Math.ceil(total[0]?.total / limit);

  return {
    meta: {
      page,
      limit,
      total: total[0]?.total,
    },
    data: result,
  };
};

const getSingleOrder = async (id: string): Promise<IOrder | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Order.aggregate([
    {
      $match: { BILLID: id },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'CUSID',
        foreignField: 'CUSID',
        pipeline: [
          {
            $project: {
              name: 1,
              contactNo: 1,
              email: 1,
            },
          },
        ],
        as: 'customer',
      },
    },
    {
      $lookup: {
        from: 'orderitems',
        localField: 'BILLID',
        foreignField: 'BILLID',
        as: 'items',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'product',
              foreignField: '_id',
              as: 'productName',
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: 'BILLID',
        foreignField: 'sell',
        as: 'payments',
      },
    },
    {
      $lookup: {
        from: 'refunds',
        localField: 'BILLID',
        foreignField: 'sell',
        as: 'refunds',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'product',
              foreignField: '_id',
              as: 'productName',
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalRefundAmount: {
          $sum: '$refunds.amount'
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'updatedBy',
        foreignField: '_id',
        as: 'updatedBy',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
  ]).exec();

  if (!result.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Not found');
  }

  return result[0];
};

const duePaymentOrder = async (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: IOrder | any,
): Promise<IOrder | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Order.findOne({ BILLID: id });

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Not found');
  }

  if (targetedData.due === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No due amount found');
  }

  if (targetedData.due < payload.amount) {
    throw new ApiError(httpStatus.NOT_FOUND, `Invalid amount. Maximum amount is ${targetedData.due}`);
  }

  const payment = {
    sell: id,
    amount: payload.amount,
    discountAmount: 0,
    discountPercent: 0,
    paymentMethod: payload.paymentMethod,
    paymentType: 'due',
    createdBy: payload.updatedBy,
  };

  await Payment.create(payment);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedData: any = {};

  updatedData.received = targetedData.received + payload.amount;
  updatedData.due = Math.round((targetedData.due - payload.amount) * 100) / 100;
  updatedData.updatedBy = payload.updatedBy;

  // set payment status
  if (updatedData.due > 0) {
    updatedData.paymentStatus = 'partial-paid';
  } else {
    updatedData.paymentStatus = 'paid';
  }

  const result = await Order.findOneAndUpdate({ BILLID: id }, updatedData, {
    new: true,
  });

  return result;
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  duePaymentOrder
};
