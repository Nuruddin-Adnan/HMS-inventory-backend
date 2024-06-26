/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { ProductService } from './product.service';
import { IProduct } from './product.interface';

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.createdBy = req.user?._id;

  const { price, discountAmount, discountPercent } = payload;

  if (discountAmount > 0 && price > 0) {
    payload.discountPercent = (discountAmount / price) * 100;
  } else if (discountPercent > 0 && price > 0) {
    payload.discountAmount = (discountPercent / 100) * price;
  }

  if (price < payload.discountAmount) {
    throw new Error('Discount can not be larger than price');
  }

  const result = await ProductService.createProduct(payload);

  sendResponse<IProduct>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product create successfully!',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await ProductService.getAllProducts(
    filters.filters,
    filters.queries,
  );
  sendResponse<IProduct[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getSingleProduct(id);

  sendResponse<IProduct>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieved successfully!',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { createdBy, ...payload } = req.body;
  payload.updatedBy = req.user?._id;

  const { price, discountAmount, discountPercent } = payload;

  if (discountAmount > 0 && price > 0) {
    payload.discountPercent = (discountAmount / price) * 100;
  } else if (discountPercent > 0 && price > 0) {
    payload.discountAmount = (discountPercent / 100) * price;
  }

  if (price < payload.discountAmount) {
    throw new Error('Discount can not be larger than price');
  }

  const result = await ProductService.updateProduct(id, payload);

  sendResponse<IProduct>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product updated successfully !',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteProduct(id);
  sendResponse<IProduct>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product deleted successfully !',
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
