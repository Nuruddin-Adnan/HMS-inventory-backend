import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { PermissionService } from './permission.service';
import { IPermission } from './permission.interface';

const createPermission = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.createdBy = req.user?._id;

  const result = await PermissionService.createPermission(payload);

  sendResponse<IPermission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permission create successfully!',
    data: result,
  });
});

const getAllPermissions = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await PermissionService.getAllPermissions(
    filters.filters,
    filters.queries,
  );
  sendResponse<IPermission[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permission retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePermission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PermissionService.getSinglePermission(id);

  sendResponse<IPermission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permission retrieved successfully!',
    data: result,
  });
});

const updatePermission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  updatedData.updatedBy = req.user?._id;
  const result = await PermissionService.updatePermission(id, updatedData);

  sendResponse<IPermission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permission updated successfully !',
    data: result,
  });
});

const deletePermission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PermissionService.deletePermission(id);
  sendResponse<IPermission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permission deleted successfully !',
    data: result,
  });
});

export const PermissionController = {
  createPermission,
  getAllPermissions,
  getSinglePermission,
  updatePermission,
  deletePermission,
};
