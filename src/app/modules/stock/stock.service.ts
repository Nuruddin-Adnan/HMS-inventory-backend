import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IStock } from './stock.interface';
import { Stock } from './stock.model';
import { stockSearchableFields } from './stock.constant';
import generatePipeline from '../../../shared/generatePipeline';
import mongoose, { Aggregate } from 'mongoose';
import { Product } from '../product/product.model';
const ObjectId = mongoose.Types.ObjectId;

const createStock = async (payload: IStock): Promise<IStock> => {
  const product = await Product.findOne({_id: payload.product})

  if(!product){
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  payload.productName = product.name;
  
  const result = (await Stock.create(payload)).toObject();
  return result;
};

const getAllStocks = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IStock[]>> => {
  const conditions = searcher(filters, stockSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPipeline: any[] = [
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
      },
    }
  ];

  const pipeline = generatePipeline(
    initialPipeline,
    conditions,
    skip,
    fields,
    sort,
    limit,
  );

  const aggregationPipeline: Aggregate<IStock[]> = Stock.aggregate(pipeline);

  const [result, total] = await Promise.all([
    aggregationPipeline.exec(),
    Stock.aggregate([{ $match: conditions }, { $count: 'total' }]),
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

const getSingleStock = async (id: string): Promise<IStock | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Stock.aggregate([
    {
      $match: { _id: new ObjectId(id) },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
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

  if (result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock item  Not found');
  }

  return result[0];
};

const updateStock = async (
  id: string,
  payload: Partial<IStock>,
): Promise<IStock | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Stock.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock Not found');
  }

  const result = await Stock.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const updateAlertQuantity = async (
  id: string,
  payload: Partial<IStock>,
): Promise<IStock | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Stock.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock Not found');
  }

  const result = await Stock.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteStock = async (id: string): Promise<IStock | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock id is invalid');
  }
  const result = await Stock.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock not found');
  }
  return result;
};

export const StockService = {
  createStock,
  getAllStocks,
  getSingleStock,
  updateStock,
  updateAlertQuantity,
  deleteStock,
};
