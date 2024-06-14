import { Schema, model } from 'mongoose';
import { OrderModel, IOrder } from './order.interface';
import { paymentStatus } from './order.constant';

const OrderSchema = new Schema<IOrder, OrderModel>(
  {
    CUSID: { type: String, trim: true },
    BILLID: { type: String, required: true },
    subtotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    vatPercent: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    received: { type: Number, required: true },
    due: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: {
        values: paymentStatus,
        message: 'Payment status can not be `{VALUE}`',
      },
      required: true,
    },
    note: { type: String },
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

export const Order = model<IOrder, OrderModel>('Order', OrderSchema);
