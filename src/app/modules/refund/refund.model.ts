import { Schema, model } from 'mongoose';
import { IRefund, RefundModel } from './refund.interface';
import { refundMethod } from './refund.constant';

const RefundSchema = new Schema<IRefund, RefundModel>(
  {
    purchase: { type: String }, //BILLID of purchase
    sell: { type: String }, //BILLID of sell
    product: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    unit: {
      type: String, //auto received from product purchase/sell in backend
      required: true,
    },
    price: {
      type: Number, //auto received from product purchase/sell in backend
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    refundMethod: {
      type: String,
      enum: {
        values: refundMethod,
        message: 'Refund method can not be `{VALUE}`',
      },
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const Refund = model<IRefund, RefundModel>('Refund', RefundSchema);
