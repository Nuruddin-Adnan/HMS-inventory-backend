/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { RefundService } from './refund.service';
import { IRefund } from './refund.interface';

const createOrderRefund = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const {updatedBy, ...payload} = req.body;
  payload.createdBy = req.user?._id;
  const BILLID = req.params.id;

  const result = await RefundService.createOrderRefund(BILLID, payload);

  sendResponse<IRefund>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order refund successfully!',
    data: result,
  });
});


const getAllRefunds = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await RefundService.getAllRefunds(
    filters.filters,
    filters.queries,
  );
  sendResponse<IRefund[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Refunds retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getTotalRefund = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await RefundService.getTotalRefund(filters.filters);
  sendResponse<any>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Refund total retrieved successfully!',
    data: result,
  });
});

const getSingleRefund = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RefundService.getSingleRefund(id);

  sendResponse<IRefund>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Refund retrieved successfully!',
    data: result,
  });
});

export const RefundController = {
  createOrderRefund,
  getTotalRefund,
  getAllRefunds,
  getSingleRefund,
};
