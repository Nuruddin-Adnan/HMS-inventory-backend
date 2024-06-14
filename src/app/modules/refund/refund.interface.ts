import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IProduct } from '../product/product.interface';

export type IRefund = {
  _id: Types.ObjectId;
  purchase: string;
  sell: string;
  product: Types.ObjectId | IProduct;
  unit: string;
  price: number;
  quantity: number;
  total: number;
  amount: number;
  refundMethod:
    | 'cash'
    | 'card'
    | 'bkash'
    | 'rocket'
    | 'mobile-banking'
    | 'bank';
  note: string;
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type RefundModel = Model<IRefund, Record<string, unknown>>;
