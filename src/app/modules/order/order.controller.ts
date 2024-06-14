/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';
import { IOrder } from './order.interface';
import calculateAmountToPercentage from '../../../helpers/calculateAmountToPercentage';
import calculatePercentageToAmount from '../../../helpers/calculatePercentageToAmount';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const {updatedBy, ...payload} = req.body;
  payload.createdBy = req.user?._id;

  const subtotal: number = payload.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0,
  );

  let total: number = 0;

  const { received, discountAmount, discountPercent, vatPercent } = payload;

  if (discountAmount > 0 && discountPercent > 0) {
    throw new Error(
      'Disount amount and discount percentage both are not acceptable together',
    );
  }

  if (discountAmount === 0 || discountPercent === 0) {
    payload.total = subtotal;
    total = subtotal;
  }

  if (discountAmount > 0) {
    if (discountAmount > subtotal) {
      throw new Error('Disount amount can not larger than subtotal');
    } else {
      payload.total = subtotal - discountAmount;
      payload.discountPercent = calculateAmountToPercentage(
        discountAmount,
        subtotal,
      );
      total = subtotal - discountAmount;
    }
  }

  if (discountPercent > 0) {
    payload.discountAmount = calculatePercentageToAmount(
      discountPercent,
      subtotal,
    );
    payload.total = subtotal - payload.discountAmount;
    total = subtotal - payload.discountAmount;
  }

  // calculate vat
  const vat =   calculatePercentageToAmount(
    vatPercent,
    (subtotal - payload.discountAmount),
  );

  payload.vatAmount = vat //set vat amount

  // adjust total. Here set value of payload total and total variable at same time. 
  payload.total = total = (subtotal - payload.discountAmount) + vat

  // payment status change
  if (received > total || received < 0) {
    throw new Error('Invalid received amount');
  } else {
    if ((discountAmount > 0 || discountPercent > 0) && total === 0) {
      payload.paymentStatus = 'free';
    } else if (payload.discountAmount > 0) {
      if (received === total) {
        payload.paymentStatus = 'discount-paid';
      } else if (received === 0) {
        payload.paymentStatus = 'unpaid';
      } else if (received < total) {
        payload.paymentStatus = 'partial-paid';
      } else {
        payload.paymentStatus = 'unpaid';
      }
    } else {
      if (received === 0) {
        payload.paymentStatus = 'unpaid';
      } else if (received < total) {
        payload.paymentStatus = 'partial-paid';
      } else {
        payload.paymentStatus = 'paid';
      }
    }
  }

  // due amount and subtotal set
  payload.subtotal = subtotal;
  payload.due = Math.round((total - received) * 100) / 100;

  const payment = {
    createdBy: req.user?._id,
    amount: payload.received,
    paymentMethod: payload.paymentMethod,
    discountAmount: payload.discountAmount,
    discountPercent: payload.discountPercent,
  };

  const createResult = await OrderService.createOrder(
    payload,
    payload.items,
    payment,
  );

  const result = await OrderService.getSingleOrder(createResult.BILLID)

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order create successfully!',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await OrderService.getAllOrders(
    filters.filters,
    filters.queries,
  );
  sendResponse<IOrder[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderService.getSingleOrder(id);

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully!',
    data: result,
  });
});

const duePaymentOrder = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.updatedBy = req.user?._id;
  const id = req.params.id;

  const result = await OrderService.duePaymentOrder(id, payload);

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Due order payment successfully!',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  duePaymentOrder
};
