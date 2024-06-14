import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IBrand } from './brand.interface';
import { brandSearchableFields } from './brand.constant';
import { Brand } from './brand.model';
import { Product } from '../product/product.model';

const createBrand = async (payload: IBrand): Promise<IBrand> => {
  const result = await Brand.create(payload);
  return result;
};

const getAllBrands = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IBrand[]>> => {
  const conditions = searcher(filters, brandSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Brand.find(conditions)
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number)
    .lean();

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Brand.countDocuments(conditions),
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

const getSingleBrand = async (id: string): Promise<IBrand | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Brand.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand Not found');
  }

  return result;
};

const updateBrand = async (
  id: string,
  payload: Partial<IBrand>,
): Promise<IBrand | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Brand.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand Not found');
  }

  const result = await Brand.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  // update product brand name
  if (result) {
    await Product.updateMany(
      { brand: targetedData.name },
      { brand: result.name },
      {
        new: true,
      },
    );
  }

  return result;
};

const deleteBrand = async (id: string): Promise<IBrand | null> => {

  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Brand.findOneAndDelete({ _id: id });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand Not found');
  }  
  return result;
};

export const BrandService = {
  createBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
  deleteBrand,
};
