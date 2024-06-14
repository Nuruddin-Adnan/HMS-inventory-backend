/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IRefund } from './refund.interface';
import { Refund } from './refund.model';
import { refundSearchableFields } from './refund.constant';
import generatePipeline from '../../../shared/generatePipeline';
import mongoose, { Aggregate } from 'mongoose';
import { Order } from '../order/order.model';
import { Stock } from '../stock/stock.model';
import { OrderItem } from '../order-item/orderItem.model';
const ObjectId = mongoose.Types.ObjectId;

const createOrderRefund = async (
  BILLID: string,
  payload: IRefund | any,
): Promise<IRefund> => {
  // match the order
  const order = await Order.aggregate([
    {
      $match: {BILLID: BILLID}
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
      $limit: 1
    }
  ])

  if(order.length === 0){
    throw new ApiError(httpStatus.NOT_FOUND, 'No order found to refund');
  }


  // Convert product ids to string for comparison
  const orderItemsWithStringProductIds = order[0].items.map((item: any) => ({
    ...item,
    product: item.product.toString(),
  }));

  const refundItems = payload.items;

  // Initialize total refund amount and total order item amount
  let totalRefundAmount = 0;

  // Matching logic
  refundItems.forEach((refundItem: any) => {
    const matchedOrderItem = orderItemsWithStringProductIds.find(
      (orderItem: any) => orderItem.product === refundItem.product,
    );

    if (!matchedOrderItem) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Product not found in order items',
      );
    }

    if (
      refundItem.quantity >
      matchedOrderItem.quantity - matchedOrderItem.refundQuantity
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid refund quantity. Maximum refund quantity for ${matchedOrderItem?.productName[0]?.name} is ${matchedOrderItem.quantity - matchedOrderItem.refundQuantity}`);
    }

    if (matchedOrderItem.price * refundItem.quantity < refundItem.amount) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid refund amount. Maximum refund amount for ${matchedOrderItem?.productName[0]?.name} is ${matchedOrderItem.price * refundItem.quantity}`);
    }

    // Calculate and add to the total refund amount
    totalRefundAmount += refundItem.amount;
  });

  // compair the received amount with total refund amount
  const sumRefundresult = await Refund.aggregate([
    {
      $match: { sell: BILLID }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const totalPrevRefundAmount = sumRefundresult.length > 0 ? sumRefundresult[0].totalAmount : 0;
  

  if(totalRefundAmount >  order[0].received - totalPrevRefundAmount){
    throw new ApiError(httpStatus.BAD_REQUEST, `Refund amount can not be large than received amount. Maximum refund amount is ${order[0].received - totalPrevRefundAmount}`);
  }

  const refundDatas = payload.items.map((refundItem: IRefund) => {
    const matchedOrderItem = orderItemsWithStringProductIds.find(
      (orderItem: any) => orderItem.product === refundItem.product,
    );
    
    return{
      ...refundItem,
      sell: BILLID,
      unit: matchedOrderItem.unit,
      price: matchedOrderItem.price,
      total: refundItem.quantity * matchedOrderItem.price,
      refundMethod: payload.refundMethod,
      note: payload.note,
      createdBy: payload.createdBy,
    }
  })
  await Refund.insertMany(refundDatas);

  for (const refundItem of refundDatas) {
    // update order items
    const orderItem = await OrderItem.findOne({BILLID: BILLID, product: refundItem.product})
    if(!orderItem){
      throw new ApiError(httpStatus.NOT_FOUND, 'Order item not found');
    }    
    orderItem.refundQuantity +=  refundItem.quantity
    orderItem.orderStatus =  orderItem.quantity === orderItem.refundQuantity ? 'full-refund' : 'partial-refund'

    await orderItem.save()

    // update stock
    const stock = await Stock.findOne({product: refundItem.product})
    if(!stock){
      throw new ApiError(httpStatus.NOT_FOUND, 'Stock not found');
    }    
    stock.quantity +=  refundItem.quantity
    stock.totalSell -=  refundItem.quantity

    await stock.save()
  }

  const result = await Order.aggregate([
    {
      $match: {BILLID: BILLID}
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
        from: 'refunds',
        localField: 'BILLID',
        foreignField: 'sell',
        as: 'refunds',
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
      $limit: 1
    }
  ])
  
  return result[0];
};

const getAllRefunds = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IRefund[]>> => {
  const conditions = searcher(filters, refundSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPipeline: any[] = [
    {
      $lookup: {
        from: 'purchases',
        localField: 'purchase',
        foreignField: 'BILLID',
        as: 'purchase',
        pipeline: [
          {
            $lookup: {
              from: 'suppliers',
              localField: 'supplier',
              foreignField: '_id',
              as: 'supplier',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    contactNo: 1,
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
        from: 'orders',
        localField: 'sell',
        foreignField: 'BILLID',
        as: 'sell',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
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
  ];

  const pipeline = generatePipeline(
    initialPipeline,
    conditions,
    skip,
    fields,
    sort,
    limit,
  );

  const aggregationPipeline: Aggregate<IRefund[]> = Refund.aggregate(pipeline);

  const [result, total] = await Promise.all([
    aggregationPipeline.exec(),
    Refund.aggregate([{ $match: conditions }, { $count: 'total' }]),
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

const getTotalRefund = async (
  filters: IFilters,
): Promise<IGenericResponse<IRefund[]>> => {
  const conditions = searcher(filters, refundSearchableFields);

  const result = await Refund.aggregate([
    { $match: conditions },
    {
      $group: {
        _id: null,
        price: { $sum: '$price' },
        quantity: { $sum: '$quantity' },
        total: { $sum: '$total' },
        amount: { $sum: '$amount' },
      },
    },
  ]);

  return {
    data: result[0],
  };
};

const getSingleRefund = async (id: string): Promise<IRefund | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Refund.aggregate([
    {
      $match: { _id: new ObjectId(id) },
    },
    {
      $lookup: {
        from: 'purchases',
        localField: 'purchase',
        foreignField: 'BILLID',
        as: 'purchase',
        pipeline: [
          {
            $lookup: {
              from: 'suppliers',
              localField: 'supplier',
              foreignField: '_id',
              as: 'supplier',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    contactNo: 1,
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
        from: 'orders',
        localField: 'sell',
        foreignField: 'BILLID',
        as: 'sell',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
      },
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

  if (result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Refund item  Not found');
  }

  return result[0];
};

export const RefundService = {
  createOrderRefund,
  getAllRefunds,
  getTotalRefund,
  getSingleRefund,
};
