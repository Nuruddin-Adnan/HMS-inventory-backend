import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { ShelveService } from './shelve.service';
import { IShelve } from './shelve.interface';

const createShelve = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.createdBy = req.user?._id;

  const result = await ShelveService.createShelve(payload);

  sendResponse<IShelve>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shelve create successfully!',
    data: result,
  });
});

const getAllShelves = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await ShelveService.getAllShelves(
    filters.filters,
    filters.queries,
  );
  sendResponse<IShelve[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shelves retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleShelve = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShelveService.getSingleShelve(id);

  sendResponse<IShelve>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shelve retrieved successfully!',
    data: result,
  });
});

const updateShelve = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  updatedData.updatedBy = req.user?._id;
  const result = await ShelveService.updateShelve(id, updatedData);

  sendResponse<IShelve>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shelve updated successfully !',
    data: result,
  });
});

const deleteShelve = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShelveService.deleteShelve(id);
  sendResponse<IShelve>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shelve deleted successfully !',
    data: result,
  });
});

export const ShelveController = {
  createShelve,
  getAllShelves,
  getSingleShelve,
  updateShelve,
  deleteShelve,
};
