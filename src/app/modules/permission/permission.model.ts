import { Schema, model } from 'mongoose';
import { PermissionModel, IPermission } from './permission.interface';
import { permissionName } from './permission.constant';

const PermissionSchema = new Schema<IPermission, PermissionModel>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      enum: {
        values: permissionName,
        message: 'Permission can not be `{VALUE}`',
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

export const Permission = model<IPermission, PermissionModel>(
  'Permission',
  PermissionSchema,
);
