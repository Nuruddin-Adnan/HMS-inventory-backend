import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { ICategory } from './category.interface';
import { categorySearchableFields } from './category.constant';
import { Category } from './category.model';

const createCategory = async (payload: ICategory): Promise<ICategory> => {
  const result = await Category.create(payload);
  return result;
};

const getAllCategories = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<ICategory[]>> => {
  const conditions = searcher(filters, categorySearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Category.find(conditions)
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number)
    .lean();

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Category.countDocuments(conditions),
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

const getSingleCategory = async (id: string): Promise<ICategory | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Category.findById(id)
  .populate('createdBy', 'name email')
  .populate('updatedBy', 'name email');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category Not found');
  }

  return result;
};

const updateCategory = async (
  id: string,
  payload: Partial<ICategory>,
): Promise<ICategory | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Category.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category Not found');
  }

  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  

  return result;
};

const deleteCategory = async (id: string): Promise<ICategory | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Category.findOneAndDelete({ _id: id });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category Not found');
  }  
  
  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
