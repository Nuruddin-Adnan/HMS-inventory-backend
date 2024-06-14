import { z } from 'zod';
import { paymentMethod } from '../payment/payment.constant';
import mongoose from 'mongoose';

const createOrderZodSchema = z.object({
  body: z.object({
    CUSID: z.string().optional(),
    items: z
      .object(
        {
          product: z.string().refine(
            value => {
              return mongoose.Types.ObjectId.isValid(value);
            },
            {
              message: 'Invalid product id',
            },
          ),
          price: z
            .number({ required_error: 'Product price is required' })
            .min(0),
          unit: z
            .string({ required_error: 'Product unit is required' })
            .trim()
            .min(1),
          quantity: z
            .number({
              required_error: 'Product quantity is required',
            })
            .min(1),
        },
        { required_error: 'Order items is required' },
      )
      .array()
      .nonempty({ message: 'Order items can not empty' }),

    discountPercent: z
      .number({
        required_error: 'Discount percent is required',
      })
      .min(0)
      .max(100),
      discountAmount: z
      .number({
        required_error: 'Discount amount is required',
      })
      .min(0),
    vatPercent: z
      .number({
        required_error: 'Vat percentage is required',
      })
      .min(0)
      .max(100),
    note: z.string().optional(), //order note
    received: z
      .number({ required_error: 'Received amount is required' })
      .min(0),
    paymentMethod: z.enum([...paymentMethod] as [string, ...string[]], {
      required_error: 'Payment method is required',
    }),
  }),
});

const duePaymentOrderZodSchema = z.object({
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

export const OrderValidation = {
  createOrderZodSchema,
  duePaymentOrderZodSchema
};
