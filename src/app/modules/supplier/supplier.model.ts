import { Schema, model } from 'mongoose';
import { ISupplier, SupplierModel } from './supplier.interface';
import { gender, status } from './supplier.constant';

const SupplierSchema = new Schema<ISupplier, SupplierModel>(
  {
    SUPID: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      trim: true,
      enum: {
        values: gender,
        message: 'Gender can not be `{VALUE}`',
      },
      required: true,
    },
    contactNo: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
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

export const Supplier = model<ISupplier, SupplierModel>(
  'Supplier',
  SupplierSchema,
);
