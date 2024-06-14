import { Schema, model } from 'mongoose';
import { ICustomer, CustomerModel } from './customer.interface';
import { gender, status } from './customer.constant';

const CustomerSchema = new Schema<ICustomer, CustomerModel>(
  {
    CUSID: {
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
      enum: {
        values: gender,
        message: 'Gender can not be `{VALUE}`',
      },
      required: true,
    },
    contactNo: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
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

export const Customer = model<ICustomer, CustomerModel>(
  'Customer',
  CustomerSchema,
);
