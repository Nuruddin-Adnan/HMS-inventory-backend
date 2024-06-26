import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { ISupplier } from './supplier.interface';
import { Supplier } from './supplier.model';
import { supplierSearchableFields } from './supplier.constant';
import { generateSUPID } from '../../../helpers/genereteID';
import generatePipeline from '../../../shared/generatePipeline';
import { Aggregate } from 'mongoose';

const createSupplier = async (payload: ISupplier): Promise<ISupplier> => {
  // Supplier id generate
  payload.SUPID = (await generateSUPID()) as string;

  const result = (await Supplier.create(payload)).toObject();
  return result;
};

const getAllSuppliers = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<ISupplier[]>> => {
  const conditions = searcher(filters, supplierSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPipeline: any[] = [
    {
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brand',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
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
  );

  const aggregationPipeline: Aggregate<ISupplier[]> =
    Supplier.aggregate(pipeline);

  const [result, total] = await Promise.all([
    aggregationPipeline.exec(),
    Supplier.aggregate([{ $match: conditions }, { $count: 'total' }]),
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

const getSingleSupplier = async (id: string): Promise<ISupplier | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  // const result = await Supplier.findOne({ _id: id })
  //   .populate({
  //     path: 'brandTest',
  //     model: 'Brand',
  //     localField: 'brandTest',
  //     foreignField: 'name',
  //     select: 'name',
  //     options: { strictPopulate: false },
  //   })
  //   .populate('createdBy')
  //   .populate('updatedBy');

  const result = await Supplier.findOne({ _id: id })
    .populate('brand')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not found');
  }

  return result;
};

const updateSupplier = async (
  id: string,
  payload: Partial<ISupplier>,
): Promise<ISupplier | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Supplier.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not found');
  }

  const result = await Supplier.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteSupplier = async (id: string): Promise<ISupplier | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier id is invalid');
  }
  const result = await Supplier.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
  }
  return result;
};

export const SupplierService = {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier,
};
