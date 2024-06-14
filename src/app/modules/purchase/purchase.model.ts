import { Schema, model } from 'mongoose';
import { IPurchase, PurchaseModel } from './purchase.interface';
import { paymentStatus } from './purchase.constant';

const PurchaseSchema = new Schema<IPurchase, PurchaseModel>(
  {
    BILLID: { type: String, required: true, unique: true },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, trim: true, required: true },
    lotNo: { type: String, trim: true },
    expiryDate: { type: Date, required: true },
    unit: { type: String, trim: true, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    advance: { type: Number, required: true },
    due: { type: Number, required: true },
    refundQuantity: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: {
        values: paymentStatus,
        message: 'Status can not be `{VALUE}`',
      },
      required: true,
    },
    refundBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const Purchase = model<IPurchase, PurchaseModel>(
  'Purchase',
  PurchaseSchema,
);
