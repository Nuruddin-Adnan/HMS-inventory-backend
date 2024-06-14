import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IOrder = {
  _id: Types.ObjectId;
  CUSID: string;
  BILLID: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
  received: number;
  due: number;
  paymentStatus:
    | 'paid'
    | 'unpaid'
    | 'partial-paid'
    | 'discount-paid'
    | 'partial-refund'
    | 'full-refund';
  note: string;
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type OrderModel = Model<IOrder, Record<string, unknown>>;
