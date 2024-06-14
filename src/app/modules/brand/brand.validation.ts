import { z } from 'zod';
import { status } from './brand.constant';

const createBrandZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Brand name is required',
    }),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

const updateBrandZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const BrandValidation = {
  createBrandZodSchema,
  updateBrandZodSchema,
};
