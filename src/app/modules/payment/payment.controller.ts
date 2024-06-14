/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';
import { IPayment } from './payment.interface';

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await PaymentService.getAllPayments(
    filters.filters,
    filters.queries,
  );
  sendResponse<IPayment[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PaymentService.getSinglePayment(id);

  sendResponse<IPayment>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment retrieved successfully!',
    data: result,
  });
});

const totalPayment = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await PaymentService.totalPayment(filters.filters);
  sendResponse<any>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment total retrieved successfully!',
    data: result,
  });
});

export const PaymentController = {
  getAllPayments,
  getSinglePayment,
  totalPayment,
};
