import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { productSearchableFields } from './product.constant';
import { generateProductCode } from '../../../helpers/genereteID';
import generatePipeline from '../../../shared/generatePipeline';
import { Aggregate } from 'mongoose';
import { Stock } from '../stock/stock.model';
import { ObjectId } from 'mongodb';

const createProduct = async (payload: IProduct): Promise<IProduct> => {
  // Product code generate
  payload.code = (await generateProductCode()) as string;

  const result = (await Product.create(payload)).toObject();
  return result;
};

const getAllProducts = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IProduct[]>> => {
  const conditions = searcher(filters, productSearchableFields);

  const { limit = 0, skip, fields, sort, nestedFilter } = queries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPipeline: any[] = [
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'shelves',
        localField: 'shelve',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'shelve',
      },
    },
  ];

  const pipeline = generatePipeline(
    initialPipeline,
    conditions,
    skip,
    fields,
    sort,
    limit,
    nestedFilter,
  );

  const aggregationPipeline: Aggregate<IProduct[]> =
    Product.aggregate(pipeline);

  const [result, total] = await Promise.all([
    aggregationPipeline.exec(),
    Product.aggregate([{ $match: conditions }, { $count: 'total' }]),
  ]);

  const page = Math.ceil(total[0]?.total / limit);

  return {
    meta: {
      page,
      limit,
      total: total[0]?.total,
    },
    data: result,
  };
};

const getSingleProduct = async (id: string): Promise<IProduct | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Product.aggregate([
    {
      $match: { _id: new ObjectId(id) },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'shelves',
        localField: 'shelve',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'shelve',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'updatedBy',
        foreignField: '_id',
        as: 'updatedBy',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
  ]).exec();

  if (!result.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product item  Not found');
  }

  return result[0];
};

const updateProduct = async (
  id: string,
  payload: Partial<IProduct>,
): Promise<IProduct | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Product.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Not found');
  }

  const result = await Product.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  if (result) {
    // Find the stock
    const stock = await Stock.findOne({ product: id });

    if (stock) {
      // eslint-disable-next-line no-unused-expressions
      (stock.productName = result.name), await stock.save();
    }
  }

  return result;
};

const deleteProduct = async (id: string): Promise<IProduct | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product id is invalid');
  }
  const result = await Product.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return result;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
