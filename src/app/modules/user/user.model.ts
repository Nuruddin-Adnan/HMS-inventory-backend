import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../../config';
import { role, status } from './user.constant';
import { IUser, UserModel } from './user.interface';

const userSchema = new Schema<IUser, UserModel>(
  {
    password: {
      type: String,
      trim: true,
      required: true,
      select: 0,
    },
    role: {
      type: String,
      enum: {
        values: role,
        message: 'User role can not be `{VALUE}`',
      },
      required: true,
    },
    permission: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    name: {
      type: String,
      trim: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    imgPath: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    seal: {
      type: String,
      trim: true,
    },
    signature: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: 'active',
      enum: {
        values: status,
        message: 'User status can not be `{VALUE}`',
      },
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

userSchema.statics.isUserExist = async function (
  email: string,
): Promise<IUser | null> {
  return await User.findOne(
    { email },
    {
      name: 1,
      email: 1,
      password: 1,
      role: 1,
      status: 1,
      permission: 1,
    },
  );
};

userSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

// User.create() / user.save()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
userSchema.pre('save', async function (next: any) {
  // hashing user password
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bycrypt_salt_rounds),
  );

  next();
});

// Create an index for email field
userSchema.index({ email: 1 }, { unique: true });

export const User = model<IUser, UserModel>('User', userSchema);
