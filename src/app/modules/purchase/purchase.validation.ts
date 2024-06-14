import { z } from 'zod';
import mongoose from 'mongoose';
import { paymentMethod } from '../payment/payment.constant';
import { refundMethod } from '../refund/refund.constant';

const createPurchaseZodSchema = z.object({
  body: z.object({
    supplier: z.string().refine(
      value => {
        return mongoose.Types.ObjectId.isValid(value);
      },
      {
        message: 'Invalid supplier id',
      },
    ),
    product: z.string().refine(
      value => {
        return mongoose.Types.ObjectId.isValid(value);
      },
      {
        message: 'Invalid product id',
      },
    ),
    lotNo: z.string().optional(),
    expiryDate: z.string({
      required_error: 'Product quantity is required',
    }),
    unit: z.string({
      required_error: 'Product quantity is required',
    }),
    quantity: z
      .number({
        required_error: 'Product quantity is required',
      })
      .min(1),
    price: z
      .number({
        required_error: 'Product price is required',
      })
      .min(0),
    advance: z
      .number({
        required_error: 'Advance amount is required',
      })
      .min(0),
    paymentMethod: z.enum([...paymentMethod] as [string, ...string[]], {
      required_error: 'Payment method is required',
    }),
    note: z.string().optional(),
  }),
});

const updatePurchaseZodSchema = z.object({
  body: z.object({
    supplier: z
      .string()
      .refine(
        value => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: 'Invalid supplier id',
        },
      )
      .optional(),
    product: z
      .string()
      .refine(
        value => {
          return mongoose.Types.ObjectId.isValid(value);
        },
        {
          message: 'Invalid product id',
        },
      )
      .optional(),
    lotNo: z.string().optional(),
    expiryDate: z.string().optional(),
    unit: z.string().optional(),
    quantity: z.number().min(1).optional(),
    price: z.number().min(0).optional(),
    advance: z.number().min(0).optional(),
    paymentMethod: z
      .enum([...paymentMethod] as [string, ...string[]])
      .optional(),
    note: z.string().optional(),
  }),
});

const duePaymentPurchaseZodSchema = z.object({
  body: z.object({
    amount: z
      .number({
        required_error: 'Amount is required',
      })
      .min(1),
    paymentMethod: z.enum([...paymentMethod] as [string, ...string[]], {
      required_error: 'Payment method is required',
    }),
  }),
});

const refundPurchaseZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({ required_error: 'Product refund quantity is required' })
      .min(1),
    refundMethod: z.enum([...refundMethod] as [string, ...string[]], {
      required_error: 'Refund method is required',
    }),
    note: z.string().optional(),
  }),
});

export const PurchaseValidation = {
  createPurchaseZodSchema,
  updatePurchaseZodSchema,
  duePaymentPurchaseZodSchema,
  refundPurchaseZodSchema,
};
