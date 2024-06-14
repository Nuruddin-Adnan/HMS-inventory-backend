import { Schema, model } from 'mongoose';
import { OrderItemModel, IOrderItem } from './orderItem.interface';
import { orderStatus } from './orderItem.constant';

const OrderItemSchema = new Schema<IOrderItem, OrderItemModel>(
  {
    BILLID: {
      type: String,
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    unit: {
      type: String,
      trim: true,
      required: true,
    },
    price: { type: Number, required: true },
    quantity: {
      type: Number,
      required: true,
    },
    refundQuantity: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      default: 'delivered',
      enum: {
        values: orderStatus,
        message: 'Order status can not be `{VALUE}`',
      },
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

export const OrderItem = model<IOrderItem, OrderItemModel>(
  'OrderItem',
  OrderItemSchema,
);
