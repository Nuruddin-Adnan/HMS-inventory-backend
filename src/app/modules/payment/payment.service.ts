import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IPayment } from './payment.interface';
import { Payment } from './payment.model';
import { paymentSearchableFields } from './payment.constant';

const getAllPayments = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IPayment[]>> => {
  const conditions = searcher(filters, paymentSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Payment.find(conditions)
    .populate('createdBy', 'name email')
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number)
    .lean();

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Payment.countDocuments(conditions),
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

const getSinglePayment = async (id: string): Promise<IPayment | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Payment.findById(id)
    .populate('createdBy')
    .populate('updatedBy');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment Not found');
  }

  return result;
};

const totalPayment = async (
  filters: IFilters,
): Promise<IGenericResponse<IPayment[]>> => {
  const conditions = searcher(filters, paymentSearchableFields);

  const result = await Payment.aggregate([
    { $match: conditions },
    {
      $group: {
        _id: null,
        discountAmount: { $sum: '$discountAmount' },
        amount: { $sum: '$amount' },
      },
    },
  ]);

  return {
    data: result[0],
  };
};

export const PaymentService = {
  getAllPayments,
  getSinglePayment,
  totalPayment,
};
