import { z } from 'zod';
import mongoose from 'mongoose';
import { status } from './stock.constant';

const createStockZodSchema = z.object({
  body: z.object({
    product: z.string().refine(
      value => {
        return mongoose.Types.ObjectId.isValid(value);
      },
      {
        message: 'Invalid product id',
      },
    ),
    quantity: z
      .number({
        required_error: 'Stock quantity is required',
      })
      .min(1),
    alertQuantity: z.number().min(1).optional(),
  }),
});

const updateStockZodSchema = z.object({
  body: z.object({
    product: z
      .string()
      .refine(
        value => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: 'Invalid product id',
        },
      )
      .optional(),
    quantity: z.number().min(1).optional(),
    alertQuantity: z.number().min(1).optional(),
  }),
});

const updatePartialZodSchema = z.object({
  body: z.object({
    alertQuantity: z.number({required_error: 'Please provide a valid alert quantity'}).min(1),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const StockValidation = {
  createStockZodSchema,
  updateStockZodSchema,
  updatePartialZodSchema
};
