import { z } from 'zod';
import { refundMethod } from './refund.constant';
import mongoose from 'mongoose';


const createOrderRefundZodSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      product: z.string().refine(
        value => mongoose.Types.ObjectId.isValid(value),
        {
          message: 'Invalid product id',
        },
      ),
      quantity: z
        .number({ required_error: 'Product refund quantity is required' })
        .min(1),
      amount: z
      .number({ required_error: 'Refund amount is required' })
      .min(0),
    })).nonempty(),
    refundMethod: z.enum([...refundMethod] as [string, ...string[]], {
      required_error: 'Refund method is required',
    }),
    note: z.string().optional(),
  }),
});

export const RefundValidation = {
  createOrderRefundZodSchema,
};
