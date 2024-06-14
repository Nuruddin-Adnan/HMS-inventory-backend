import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { GenericService } from './generic.service';
import { IGeneric } from './generic.interface';

const createGeneric = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.createdBy = req.user?._id;

  const result = await GenericService.createGeneric(payload);

  sendResponse<IGeneric>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Generic create successfully!',
    data: result,
  });
});

const getAllGenerics = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await GenericService.getAllGenerics(
    filters.filters,
    filters.queries,
  );
  sendResponse<IGeneric[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Generics retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleGeneric = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GenericService.getSingleGeneric(id);

  sendResponse<IGeneric>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Generic retrieved successfully!',
    data: result,
  });
});

const updateGeneric = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  updatedData.updatedBy = req.user?._id;
  const result = await GenericService.updateGeneric(id, updatedData);

  sendResponse<IGeneric>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Generic updated successfully !',
    data: result,
  });
});

const deleteGeneric = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GenericService.deleteGeneric(id);
  sendResponse<IGeneric>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Generic deleted successfully !',
    data: result,
  });
});

export const GenericController = {
  createGeneric,
  getAllGenerics,
  getSingleGeneric,
  updateGeneric,
  deleteGeneric,
};
