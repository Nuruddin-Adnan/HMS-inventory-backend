import { z } from 'zod';
import { permissionName } from './permission.constant';

const createPermissionZodSchema = z.object({
  body: z.object({
    name: z.enum([...permissionName] as [string, ...string[]], {
      required_error: 'Permission name is required',
    }),
  }),
});

const updatePermissionZodSchema = z.object({
  body: z.object({
    name: z.enum([...permissionName] as [string, ...string[]]).optional(),
  }),
});

export const PermissionValidation = {
  createPermissionZodSchema,
  updatePermissionZodSchema,
};
