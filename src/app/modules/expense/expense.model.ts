import { Schema, model } from 'mongoose';
import { ExpenseModel, IExpense } from './expense.interface';

const ExpenseSchema = new Schema<IExpense, ExpenseModel>(
  {
    purpose: {
      type: String,
      trim: true,
      required: true,
    },
    expenseDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      trim: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const Expense = model<IExpense, ExpenseModel>(
  'Expense',
  ExpenseSchema,
);
