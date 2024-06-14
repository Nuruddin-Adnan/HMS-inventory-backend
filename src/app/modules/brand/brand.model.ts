import { Schema, model } from 'mongoose';
import { BrandModel, IBrand } from './brand.interface';
import { status } from './brand.constant';

const BrandSchema = new Schema<IBrand, BrandModel>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
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

export const Brand = model<IBrand, BrandModel>('Brand', BrandSchema);
