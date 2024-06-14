import { z } from 'zod';
import { status } from './generic.constant';

const createGenericZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Generic name is required',
    }),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

const updateGenericZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const GenericValidation = {
  createGenericZodSchema,
  updateGenericZodSchema,
};
