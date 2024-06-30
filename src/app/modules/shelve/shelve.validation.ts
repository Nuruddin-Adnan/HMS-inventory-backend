import { z } from 'zod';
import { status } from './shelve.constant';

const createShelveZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Shelve name is required',
    }),
    description: z.string().optional(),
  }),
});

const updateShelveZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum([...status] as [string, ...string[]]).optional(),
  }),
});

export const ShelveValidation = {
  createShelveZodSchema,
  updateShelveZodSchema,
};
