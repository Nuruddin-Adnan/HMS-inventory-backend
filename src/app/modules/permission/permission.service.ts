import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IPermission } from './permission.interface';
import { permissionSearchableFields } from './permission.constant';
import { Permission } from './permission.model';

const createPermission = async (payload: IPermission): Promise<IPermission> => {
  const result = await Permission.create(payload);
  return result;
};

const getAllPermissions = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IPermission[]>> => {
  const conditions = searcher(filters, permissionSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Permission.find(conditions)
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number);

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Permission.countDocuments(conditions),
  ]);

  const page = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSinglePermission = async (id: string): Promise<IPermission | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Permission.findById(id)
    .populate('createdBy')
    .populate('updatedBy');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission Not found');
  }

  return result;
};

const updatePermission = async (
  id: string,
  payload: Partial<IPermission>,
): Promise<IPermission | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Permission.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission Not found');
  }

  const result = await Permission.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deletePermission = async (id: string): Promise<IPermission | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission Not found');
  }
  const result = await Permission.findOneAndDelete({ _id: id });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission Not found');
  }
  return result;
};

export const PermissionService = {
  createPermission,
  getAllPermissions,
  getSinglePermission,
  updatePermission,
  deletePermission,
};
