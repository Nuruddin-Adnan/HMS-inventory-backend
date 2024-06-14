import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { OrderItemService } from './orderItem.service';
import { IOrderItem } from './orderItem.interface';

const getAllOrderItems = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await OrderItemService.getAllOrderItems(
    filters.filters,
    filters.queries,
  );
  sendResponse<IOrderItem[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order items retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleOrderItem = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderItemService.getSingleOrderItem(id);

  sendResponse<IOrderItem>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order item retrieved successfully!',
    data: result,
  });
});

export const OrderItemController = {
  getAllOrderItems,
  getSingleOrderItem,
};
