import { z } from 'zod';
import { gender, status } from './supplier.constant';
import mongoose from 'mongoose';

const createSupplierZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Supplier name is required',
    }),
    age: z.number().min(1).max(150).optional(),
    gender: z.enum([...gender] as [string, ...string[]], {
      required_error: 'Gender is required',
    }),
    contactNo: z
      .string({ required_error: 'Please provide a valid contact number' })
      .min(6)
      .max(15),
    email: z.string().optional(),
    address: z.string().optional(),
    brand: z.string().refine(
      value => {
        return mongoose.Types.ObjectId.isValid(value);
      },
      {
        message: 'Invalid brand id',
      },
    ),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

const updateSupplierZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    age: z.number().min(1).max(150).optional(),
    gender: z.enum([...gender] as [string, ...string[]]).optional(),
    contactNo: z
      .string({ required_error: 'Please provide a valid contact number' })
      .min(6)
      .max(15)
      .optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    brand: z
      .string()
      .refine(
        value => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: 'Invalid brand id',
        },
      )
      .optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const SupplierValidation = {
  createSupplierZodSchema,
  updateSupplierZodSchema,
};
