import { z } from 'zod';
import { status } from './category.constant';

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Category name is required',
    }),
    description: z.string().optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};
