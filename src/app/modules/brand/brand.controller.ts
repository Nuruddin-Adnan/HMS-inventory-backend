import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { BrandService } from './brand.service';
import { IBrand } from './brand.interface';

const createBrand = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.createdBy = req.user?._id;

  const result = await BrandService.createBrand(payload);

  sendResponse<IBrand>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brand create successfully!',
    data: result,
  });
});

const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await BrandService.getAllBrands(
    filters.filters,
    filters.queries,
  );
  sendResponse<IBrand[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brands retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BrandService.getSingleBrand(id);

  sendResponse<IBrand>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brand retrieved successfully!',
    data: result,
  });
});

const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  updatedData.updatedBy = req.user?._id;
  const result = await BrandService.updateBrand(id, updatedData);

  sendResponse<IBrand>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brand updated successfully !',
    data: result,
  });
});

const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BrandService.deleteBrand(id);
  sendResponse<IBrand>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brand deleted successfully !',
    data: result,
  });
});

export const BrandController = {
  createBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
  deleteBrand,
};
