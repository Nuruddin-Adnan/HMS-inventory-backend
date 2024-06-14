import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { ENUM_USER_PERMISSION } from '../../../enums/user';

export type IPermission = {
  _id: Types.ObjectId;
  name: ENUM_USER_PERMISSION;
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type PermissionModel = Model<IPermission, Record<string, unknown>>;
