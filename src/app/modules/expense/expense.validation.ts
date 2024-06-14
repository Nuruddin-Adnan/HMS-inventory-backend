import { z } from 'zod';

const createExpenseZodSchema = z.object({
  body: z.object({
    purpose: z.string({
      required_error: 'Expense purpose is required',
    }),
    expenseDate: z.string().optional(),
    description: z.string().optional(),
    amount: z.number({
      required_error: 'Expense amount is required',
    }).min(1)
  }),
});

const updateExpenseZodSchema = z.object({
  body: z.object({
    purpose: z.string().optional(),
    expenseDate: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().min(1).optional(),
  }),
});

export const ExpenseValidation = {
  createExpenseZodSchema,
  updateExpenseZodSchema,
};
