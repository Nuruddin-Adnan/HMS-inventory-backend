import { Schema, model } from 'mongoose';
import { GenericModel, IGeneric } from './generic.interface';
import { status } from './generic.constant';

const GenericSchema = new Schema<IGeneric, GenericModel>(
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

export const Generic = model<IGeneric, GenericModel>('Generic', GenericSchema);
