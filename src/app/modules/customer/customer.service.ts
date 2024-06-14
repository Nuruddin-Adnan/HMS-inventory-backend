import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { ICustomer } from './customer.interface';
import { Customer } from './customer.model';
import { customerSearchableFields } from './customer.constant';
import { generateCUSID } from '../../../helpers/genereteID';

const createCustomer = async (payload: ICustomer): Promise<ICustomer> => {
  // Customer id generate
  payload.CUSID = (await generateCUSID()) as string;

  const result = (await Customer.create(payload)).toObject();
  return result;
};

const getAllCustomers = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<ICustomer[]>> => {
  const conditions = searcher(filters, customerSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Customer.find(conditions)
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number)
    .lean();

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Customer.countDocuments(conditions),
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

const getSingleCustomer = async (id: string): Promise<ICustomer | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Customer.findOne({ _id: id })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer Not found');
  }

  return result;
};

const updateCustomer = async (
  id: string,
  payload: Partial<ICustomer>,
): Promise<ICustomer | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Customer.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer Not found');
  }

  const result = await Customer.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  

  return result;
};

const deleteCustomer = async (id: string): Promise<ICustomer | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer id is invalid');
  }
  const result = await Customer.findOneAndDelete({ _id: id });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  return result;
};

export const CustomerService = {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};
