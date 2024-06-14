import { z } from 'zod';
import { role, status } from './user.constant';

const createUserZodSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: 'Password is required',
    }),
    role: z.enum([...role] as [string, ...string[]], {
      required_error: 'Role is required',
    }),
    name: z.string({
      required_error: 'Password is required',
    }),
    phoneNumber: z.string().optional(),
    email: z.string({
      required_error: 'Email address is required',
    }),
    imgPath: z.string().optional(),
    address: z.string().optional(),
    seal: z.string().optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    password: z.string().optional(),
    role: z.enum([...role] as [string, ...string[]]).optional(),
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    imgPath: z.string().optional(),
    address: z.string().optional(),
    seal: z.string().optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
