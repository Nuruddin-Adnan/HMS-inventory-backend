import { Schema, model } from 'mongoose';
import { CategoryModel, ICategory } from './category.interface';
import { status } from './category.constant';

const CategorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
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

export const Category = model<ICategory, CategoryModel>(
  'Category',
  CategorySchema,
);
