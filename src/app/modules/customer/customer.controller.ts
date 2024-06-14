/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { CustomerService } from './customer.service';
import { ICustomer } from './customer.interface';

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const { CUSID, ...payload } = req.body;
  payload.createdBy = req.user?._id;

  const result = await CustomerService.createCustomer(payload);

  sendResponse<ICustomer>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer create successfully!',
    data: result,
  });
});

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await CustomerService.getAllCustomers(
    filters.filters,
    filters.queries,
  );
  sendResponse<ICustomer[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customers retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerService.getSingleCustomer(id);

  sendResponse<ICustomer>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer retrieved successfully!',
    data: result,
  });
});

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { createdBy, CUSID, ...updatedData } = req.body;
  updatedData.updatedBy = req.user?._id;

  const result = await CustomerService.updateCustomer(id, updatedData);

  sendResponse<ICustomer>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer updated successfully !',
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerService.deleteCustomer(id);
  sendResponse<ICustomer>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer deleted successfully !',
    data: result,
  });
});

export const CustomerController = {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};
