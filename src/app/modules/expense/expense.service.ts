import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IExpense } from './expense.interface';
import { expenseSearchableFields } from './expense.constant';
import { Expense } from './expense.model';

const createExpense = async (payload: IExpense): Promise<IExpense> => {
  const result = await Expense.create(payload);
  return result;
};

const getAllExpenses = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IExpense[]>> => {
  const conditions = searcher(filters, expenseSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Expense.find(conditions)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number)
    .lean();

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Expense.countDocuments(conditions),
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

const getSingleExpense = async (id: string): Promise<IExpense | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Expense.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .lean();

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense Not found');
  }

  return result;
};

const updateExpense = async (
  id: string,
  payload: Partial<IExpense>,
): Promise<IExpense | null> => {
  const result = await Expense.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteExpense = async (id: string): Promise<IExpense | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense Not found');
  }
  const result = await Expense.findOneAndDelete({ _id: id });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense Not found');
  }
  
  return result;
};

export const ExpenseService = {
  createExpense,
  getAllExpenses,
  getSingleExpense,
  updateExpense,
  deleteExpense,
};
