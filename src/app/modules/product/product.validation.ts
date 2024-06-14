import { z } from 'zod';
import { status } from './product.constant';
import mongoose from 'mongoose';

const createProductZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Product name is required',
    })
    .trim()
    .min(1),
    category: z.string().refine(
      value => {
        return mongoose.Types.ObjectId.isValid(value);
      },
      {
        message: 'Invalid category id',
      },
    ),
    brand: z.string()
    .trim()
    .min(1),
    genericName: z.string()
    .trim()
    .min(1),
    shelve: z
      .string()
      .refine(
        value => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: 'Invalid shelve id',
        },
      )
      .optional(),
    description: z.string().optional(),
    unit: z.string({
      required_error: 'Product minimum selling unit is required',
    }).trim()
    .min(1),
    price: z
      .number({
        required_error: 'Product price is required',
      })
      .min(0),
    discountPercent: z
      .number({
        required_error: 'Discount percent is required',
      })
      .min(0)
      .max(100),
    discountAmount: z
      .number({
        required_error: 'Discount amount is required',
      })
      .min(0)
    }).superRefine((data, ctx) => {
      const { discountPercent, discountAmount } = data;
      
      if (discountPercent > 0 && discountAmount > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Both discountPercent and discountAmount cannot be greater than 0 at the same time',
          path: ['discountPercent'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Both discountPercent and discountAmount cannot be greater than 0 at the same time',
          path: ['discountAmount'],
        });
      } 
    })
  });

const updateProductZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Product name is required',
    })
    .trim()
    .min(1)
    .optional(),
    category: z
      .string()
      .refine(
        value => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: 'Invalid category id',
        },
      )
      .optional(),
    brand: z.string()
    .trim()
    .min(1)
    .optional(),
    genericName: z.string()
    .trim()
    .min(1)
    .optional(),
    shelve: z
      .string()
      .refine(
        value => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: 'Invalid shelve id',
        },
      )
      .optional(),
    description: z.string().optional(),
    unit: z.string()
    .trim()
    .min(1)
    .optional(),
    price: z
      .number({
        required_error: 'Product price is required',
      })
      .min(0)
      .optional(),
    discountPercent: z.number().min(0).max(100),
    discountAmount: z.number().min(0),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const ProductValidation = {
  createProductZodSchema,
  updateProductZodSchema,
};
