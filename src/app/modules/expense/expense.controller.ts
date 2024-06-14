/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { ExpenseService } from './expense.service';
import { IExpense } from './expense.interface';
import { Expense } from './expense.model';

const createExpense = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.createdBy = req.user?._id;

  const result = await ExpenseService.createExpense(payload);

  sendResponse<IExpense>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense create successfully!',
    data: result,
  });
});

const getAllExpenses = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await ExpenseService.getAllExpenses(
    filters.filters,
    filters.queries,
  );
  sendResponse<IExpense[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleExpense = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ExpenseService.getSingleExpense(id);

  sendResponse<IExpense>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense retrieved successfully!',
    data: result,
  });
});

const updateExpense = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  updatedData.updatedBy = req.user?._id;

  const targetedData = await Expense.findById(id);

  if (!targetedData) {
    throw new Error('Expense Not found');
  }

  // Function to check if the update is within two days
  const canUpdateExpense = (createdAt: any) => {
    const now: any = new Date();
    const creationDate: any = new Date(createdAt);
    const diffTime = Math.abs(now - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };


  if(req.user?.role !== 'super_admin'){
    if(targetedData?.createdBy.toString() !== req.user?._id){
      throw new Error('You are not authorized to update');
    } else if (!canUpdateExpense(targetedData?.createdAt)) {
      throw new Error('You can only update expenses within two days of creation!');
    }
  }

  const result = await ExpenseService.updateExpense(id, updatedData);

  sendResponse<IExpense>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense updated successfully !',
    data: result,
  });
});

const deleteExpense = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ExpenseService.deleteExpense(id);
  sendResponse<IExpense>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense deleted successfully !',
    data: result,
  });
});

export const ExpenseController = {
  createExpense,
  getAllExpenses,
  getSingleExpense,
  updateExpense,
  deleteExpense,
};
