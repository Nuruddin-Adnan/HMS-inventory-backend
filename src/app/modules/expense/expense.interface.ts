import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IExpense = {
  _id: Types.ObjectId;
  purpose: string;
  expenseDate: Date;
  description: string;
  amount: number;
  createdBy: Types.ObjectId | IUser;
  createdAt: Date;
  updatedBy: Types.ObjectId | IUser | null;
};

export type ExpenseModel = Model<IExpense, Record<string, unknown>>;
