import { z } from 'zod';
import { gender, status } from './customer.constant';

const createCustomerZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Customer name is required',
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
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

const updateCustomerZodSchema = z.object({
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
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const CustomerValidation = {
  createCustomerZodSchema,
  updateCustomerZodSchema,
};
