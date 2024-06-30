/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { StockService } from './stock.service';
import { IStock } from './stock.interface';

const createStock = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.createdBy = req.user?._id;

  const result = await StockService.createStock(payload);

  sendResponse<IStock>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock create successfully!',
    data: result,
  });
});

const getAllStocks = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await StockService.getAllStocks(
    filters.filters,
    filters.queries,
  );
  sendResponse<IStock[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stocks retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleStock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StockService.getSingleStock(id);

  sendResponse<IStock>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock retrieved successfully!',
    data: result,
  });
});

const updateStock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { createdBy, SUPID, ...updatedData } = req.body;
  updatedData.updatedBy = req.user?._id;

  const result = await StockService.updateStock(id, updatedData);

  sendResponse<IStock>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock updated successfully !',
    data: result,
  });
});

const updatePartialStock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { alertQuantity, status, ...others } = req.body;

  // update with new alert quantity
  const updatedData = {
    updatedBy : req.user?._id,
    alertQuantity: alertQuantity,
    status: status
  }

  const result = await StockService.updatePartialStock(id, updatedData);

  sendResponse<IStock>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock updated successfully!',
    data: result,
  });
});

const deleteStock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StockService.deleteStock(id);
  sendResponse<IStock>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock deleted successfully !',
    data: result,
  });
});

export const StockController = {
  createStock,
  getAllStocks,
  getSingleStock,
  updateStock,
  updatePartialStock,
  deleteStock,
};
