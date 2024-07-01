import { Schema, model } from 'mongoose';
import { IProduct, ProductModel } from './product.interface';
import { status } from './product.constant';

const ProductSchema = new Schema<IProduct, ProductModel>(
  {
    tag: { type: String, unique: true, required: true },
    code: { type: String, trim: true },
    name: { type: String, trim: true, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    genericName: { type: String, trim: true },
    brand: { type: String, trim: true, required: true },
    shelve: { type: String, trim: true },
    description: { type: String, trim: true },
    unit: { type: String, trim: true, required: true },
    price: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    status: {
      type: String,
      default: 'active',
      enum: {
        values: status,
        message: 'Status can not be `{VALUE}`',
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

// Ensure `unique` fields are indexed
ProductSchema.index({ tag: 1 }, { unique: true });
ProductSchema.index({ name: 1 }, { unique: true });

export const Product = model<IProduct, ProductModel>('Product', ProductSchema);
