/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IPurchase } from './purchase.interface';
import { Purchase } from './purchase.model';
import { purchaseSearchableFields } from './purchase.constant';
import generatePipeline from '../../../shared/generatePipeline';
import { generatePURCHASEID } from '../../../helpers/genereteID';
import { IPayment } from '../payment/payment.interface';
import { Payment } from '../payment/payment.model';
import { Product } from '../product/product.model';
import { Supplier } from '../supplier/supplier.model';
import { Stock } from '../stock/stock.model';
import { Aggregate } from 'mongoose';
import { Refund } from '../refund/refund.model';

const createPurchase = async (
  payload: IPurchase,
  payment: Partial<IPayment>,
): Promise<IPurchase> => {
  // check product exist or not
  const targetedProduct = await Product.findById(payload.product);
  if (!targetedProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid product id');
  }

  // check supplier exist or not
  const targetedSupplier = await Supplier.findById(payload.supplier);
  if (!targetedSupplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid supplier id');
  }

  const BILLID = (await generatePURCHASEID()) as string;

  // Purchase data
  payload.BILLID = BILLID;
  payload.productName = targetedProduct.name;
  payload.total = payload.price * payload.quantity;
  payload.due = payload.total - payload.advance;

  if (payload.due < 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid purchase amount');
  }

  // payment status
  if (payload.advance === 0) {
    payload.paymentStatus = 'unpaid';
  } else {
    if (payload.due === 0) {
      payload.paymentStatus = 'paid';
    } else if (payload.total > payload.advance) {
      payload.paymentStatus = 'partial-paid';
    }
  }

  // payment.data
  payment.paymentType = 'new';
  payment.purchase = BILLID;

  // create purchase
  const result = (await Purchase.create(payload)).toObject();

  // create payment
  if (payload.advance > 0) {
    await Payment.create(payment);
  }

  // update/create stock
  // Find the stock corresponding to the purchase
  let stock = await Stock.findOne({ product: payload.product });

  if (!stock) {
    // If stock not found, create a new one
    stock = new Stock({
      product: payload.product,
      quantity: payload.quantity,
      createdBy: payload.createdBy,
      productName: targetedProduct.name,
    });
  } else {
    // If stock found, update it
    // eslint-disable-next-line no-unused-expressions
    (stock.quantity += payload.quantity),
      (stock.productName = targetedProduct.name),
      (stock.updatedBy = payload.createdBy);
  }

  // Save the stock (either new or updated)
  await stock.save();

  return result;
};

const getAllPurchases = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IPurchase[]>> => {
  const conditions = searcher(filters, purchaseSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPipeline: any[] = [
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
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier',
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

  const aggregationPipeline: Aggregate<IPurchase[]> =
    Purchase.aggregate(pipeline);

  // Stage to count total documents without pagination
  const totalCountStage = { $count: 'total' };

  const [result, total] = await Promise.all([
    aggregationPipeline.exec(),
    Purchase.aggregate([{ $match: conditions }, totalCountStage]),
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

const getSinglePurchase = async (id: string): Promise<IPurchase | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Purchase.aggregate([
    {
      $match: { BILLID: id },
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
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier',
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: 'BILLID',
        foreignField: 'purchase',
        as: 'payments',
      },
    },
    {
      $lookup: {
        from: 'refunds',
        localField: 'BILLID',
        foreignField: 'purchase',
        as: 'refunds',
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
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase item  Not found');
  }

  return result[0];
};

const updatePurchase = async (
  id: string,
  payload: Partial<IPurchase>,
): Promise<IPurchase | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Purchase.findOne({ BILLID: id });

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase Not found');
  }

  const result = await Purchase.findOneAndUpdate({ BILLID: id }, payload, {
    new: true,
  });

  return result;
};

const duePaymentPurchase = async (
  id: string,
  payload: any,
): Promise<IPurchase | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Purchase.findOne({ BILLID: id });

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase Not found');
  }

  if (targetedData.due === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No due amount found');
  }

  if (targetedData.due < payload.amount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid amount');
  }

  const payment = {
    purchase: id,
    amount: payload.amount,
    discountAmount: 0,
    discountPercent: 0,
    paymentMethod: payload.paymentMethod,
    paymentType: 'due',
    createdBy: payload.updatedBy,
  };

  await Payment.create(payment);

  const updatedData: any = {};

  updatedData.advance = targetedData.advance + payload.amount;
  updatedData.due = targetedData.due - payload.amount;
  updatedData.updatedBy = payload.updatedBy;

  // set payment status
  if (updatedData.due > 0) {
    updatedData.paymentStatus = 'partial-paid';
  } else {
    updatedData.paymentStatus = 'paid';
  }

  const result = await Purchase.findOneAndUpdate({ BILLID: id }, updatedData, {
    new: true,
  });

  return result;
};

const refundPurchase = async (
  id: string,
  payload: any,
): Promise<IPurchase | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const purchase = await Purchase.findOne({ BILLID: id }); //get the purchase data
  if (!purchase) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No purchase item found to refund',
    );
  }

  // validate refund quantity with avaiable quantity
  if (payload.quantity > purchase.quantity - purchase.refundQuantity) {
    throw new ApiError(httpStatus.NOT_FOUND, `Invalid refund quantity`);
  }

  // validate refund quantity with stock quantity
  const stock = await Stock.findOne({ product: purchase.product }); //get the purchase data
  if (stock) {
    if (payload.quantity > stock.quantity) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Not enough stock to refund. Stock quantity is ${stock.quantity}`,
      );
    }

    // substruct stock quantity
    // eslint-disable-next-line no-unused-expressions
    stock.quantity -= payload.quantity;
    await stock.save(); //update stock
  }

  // total, due, refundBy, refundQuantity
  // update purchase
  purchase.refundBy = payload.updatedBy;
  purchase.refundQuantity += payload.quantity;
  purchase.total =
    (purchase.quantity - purchase.refundQuantity) * purchase.price;

  const newDueAmount = purchase.total - purchase.advance;

  // update due amount
  if (newDueAmount < 0) {
    purchase.due = 0;
  } else {
    purchase.due = newDueAmount;
  }

  // update paymentStatus
  if (purchase.refundQuantity === purchase.quantity) {
    purchase.paymentStatus = 'full-refund';
  } else {
    purchase.paymentStatus = 'partial-refund';
  }
  await purchase.save(); //save purshase with update data

  // refund create
  const refundData: any = {};

  refundData.purchase = id;
  refundData.product = purchase.product;
  refundData.unit = purchase.unit;
  refundData.price = purchase.price;
  refundData.quantity = payload.quantity;
  refundData.total = refundData.quantity * refundData.price;
  refundData.refundMethod = payload.refundMethod;
  refundData.note = payload.note;
  refundData.createdBy = payload.updatedBy;


  // get the previous refund amount
  if (purchase.total - purchase.advance < 0) {
    const result = await Refund.aggregate([
      {
        $match: { purchase: purchase.BILLID }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const previousRefundAmount = result.length > 0 ? result[0].totalAmount : 0;
    

    // subtract previous refund amount and save only current refund amount
    refundData.amount = Math.abs(purchase.total - purchase.advance) - previousRefundAmount;
  } else {
    refundData.amount = 0;
  }

  await Refund.create(refundData); //create new refund

  return purchase;
};

const deletePurchase = async (id: string): Promise<IPurchase | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase id is invalid');
  }
  const result = await Purchase.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase not found');
  }
  return result;
};

export const PurchaseService = {
  createPurchase,
  getAllPurchases,
  getSinglePurchase,
  updatePurchase,
  duePaymentPurchase,
  refundPurchase,
  deletePurchase,
};
