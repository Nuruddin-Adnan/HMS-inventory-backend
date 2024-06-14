import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IGeneric } from './generic.interface';
import { genericSearchableFields } from './generic.constant';
import { Generic } from './generic.model';
import { Product } from '../product/product.model';

const createGeneric = async (payload: IGeneric): Promise<IGeneric> => {
  const result = await Generic.create(payload);
  return result;
};

const getAllGenerics = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IGeneric[]>> => {
  const conditions = searcher(filters, genericSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Generic.find(conditions)
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number)
    .lean();

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Generic.countDocuments(conditions),
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

const getSingleGeneric = async (id: string): Promise<IGeneric | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Generic.findById(id)
    .populate('createdBy','name email')
    .populate('updatedBy','name email');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Generic Not found');
  }

  return result;
};

const updateGeneric = async (
  id: string,
  payload: Partial<IGeneric>,
): Promise<IGeneric | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Generic.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Generic Not found');
  }

  const result = await Generic.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  // update product generic name
  if (result) {
    await Product.updateMany(
      { genericName: targetedData.name },
      { genericName: result.name },
      {
        new: true,
      },
    );
  }

  return result;
};

const deleteGeneric = async (id: string): Promise<IGeneric | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Generic Not found');
  }
  const result = await Generic.findOneAndDelete({ _id: id });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Generic not found');
  }
  return result;
};

export const GenericService = {
  createGeneric,
  getAllGenerics,
  getSingleGeneric,
  updateGeneric,
  deleteGeneric,
};
