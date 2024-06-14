/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { SupplierService } from './supplier.service';
import { ISupplier } from './supplier.interface';

const createSupplier = catchAsync(async (req: Request, res: Response) => {
  const { SUPID, ...payload } = req.body;
  payload.createdBy = req.user?._id;

  const result = await SupplierService.createSupplier(payload);

  sendResponse<ISupplier>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Supplier create successfully!',
    data: result,
  });
});

const getAllSuppliers = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await SupplierService.getAllSuppliers(
    filters.filters,
    filters.queries,
  );
  sendResponse<ISupplier[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Supplier retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleSupplier = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SupplierService.getSingleSupplier(id);

  sendResponse<ISupplier>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Supplier retrieved successfully!',
    data: result,
  });
});

const updateSupplier = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { createdBy, SUPID, ...updatedData } = req.body;
  updatedData.updatedBy = req.user?._id;

  const result = await SupplierService.updateSupplier(id, updatedData);

  sendResponse<ISupplier>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Supplier updated successfully !',
    data: result,
  });
});

const deleteSupplier = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SupplierService.deleteSupplier(id);
  sendResponse<ISupplier>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Supplier deleted successfully !',
    data: result,
  });
});

export const SupplierController = {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier,
};
