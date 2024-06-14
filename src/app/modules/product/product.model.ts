import { Schema, model } from 'mongoose';
import { IProduct, ProductModel } from './product.interface';
import { status } from './product.constant';

const ProductSchema = new Schema<IProduct, ProductModel>(
  {
    code: { type: String, unique: true, required: true },
    name: { type: String, trim: true, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, trim: true, required: true },
    genericName: { type: String, trim: true },
    shelve: { type: Schema.Types.ObjectId, ref: 'Shelve' },
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

export const Product = model<IProduct, ProductModel>('Product', ProductSchema);
