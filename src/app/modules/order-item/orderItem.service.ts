import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IOrderItem } from './orderItem.interface';
import { orderItemSearchableFields } from './orderItem.constant';
import { OrderItem } from './orderItem.model';
import generatePipeline from '../../../shared/generatePipeline';
import { Aggregate } from 'mongoose';
import { ObjectId } from 'mongodb';

const getAllOrderItems = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IOrderItem[]>> => {
  const conditions = searcher(filters, orderItemSearchableFields);

  const { limit = 0, skip, fields, sort, nestedFilter } = queries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPipeline: any[] = [];

  const pipeline = generatePipeline(
    initialPipeline,
    conditions,
    skip,
    fields,
    sort,
    limit,
    nestedFilter,
  );

  const aggregationPipeline: Aggregate<IOrderItem[]> = OrderItem.aggregate(pipeline);

  const [result, total] = await Promise.all([
    aggregationPipeline.exec(),
    OrderItem.aggregate([{ $match: conditions }, { $count: 'total' }]),
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

const getSingleOrderItem = async (id: string): Promise<IOrderItem | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await OrderItem.aggregate([
    {
      $match: { _id: new ObjectId(id) }
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'BILLID',
        foreignField: 'BILLID',
        pipeline: [
          {
            $lookup: {
              from: 'customers',
              localField: 'CUSID',
              foreignField: 'CUSID',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    contactNo: 1,
                    email: 1,
                  },
                },
              ],
              as: 'customer',
            },
          },
        ],
        as: 'order',
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
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Not found');
  }

  return result[0];
};

export const OrderItemService = {
  getAllOrderItems,
  getSingleOrderItem,
};
