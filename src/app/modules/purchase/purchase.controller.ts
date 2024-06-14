/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { PurchaseService } from './purchase.service';
import { IPurchase } from './purchase.interface';

const createPurchase = catchAsync(async (req: Request, res: Response) => {
  const { refundBy, refundQuantity, refundAmount, ...payload } = req.body;
  payload.createdBy = req.user?._id;

  const payment = {
    createdBy: req.user?._id,
    amount: payload.advance,
    discountAmount: 0,
    discountPercent: 0,
    paymentMethod: payload.paymentMethod,
  };

  const result = await PurchaseService.createPurchase(payload, payment);

  sendResponse<IPurchase>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchase create successfully!',
    data: result,
  });
});

const duePaymentPurchase = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.updatedBy = req.user?._id;
  const id = req.params.id;

  const result = await PurchaseService.duePaymentPurchase(id, payload);

  sendResponse<IPurchase>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Due purchase payment successfully!',
    data: result,
  });
});

const refundPurchase = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.updatedBy = req.user?._id;
  const id = req.params.id;

  const result = await PurchaseService.refundPurchase(id, payload);

  sendResponse<IPurchase>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchase refund successfully!',
    data: result,
  });
});

const getAllPurchases = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await PurchaseService.getAllPurchases(
    filters.filters,
    filters.queries,
  );
  sendResponse<IPurchase[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchases retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePurchase = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PurchaseService.getSinglePurchase(id);

  sendResponse<IPurchase>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchase retrieved successfully!',
    data: result,
  });
});

const updatePurchase = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { createdBy, SUPID, ...updatedData } = req.body;
  updatedData.updatedBy = req.user?._id;

  const result = await PurchaseService.updatePurchase(id, updatedData);

  sendResponse<IPurchase>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchase updated successfully !',
    data: result,
  });
});

const deletePurchase = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PurchaseService.deletePurchase(id);
  sendResponse<IPurchase>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchase deleted successfully !',
    data: result,
  });
});

export const PurchaseController = {
  createPurchase,
  duePaymentPurchase,
  refundPurchase,
  getAllPurchases,
  getSinglePurchase,
  updatePurchase,
  deletePurchase,
};
