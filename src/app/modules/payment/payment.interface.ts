import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IPayment = {
  _id: Types.ObjectId;
  purchase: string;
  sell: string; // need to update this code with sell model
  amount: number;
  discountAmount: number;
  discountPercent: number;
  paymentMethod:
    | 'cash'
    | 'card'
    | 'bkash'
    | 'rocket'
    | 'mobile-banking'
    | 'bank';
  paymentType: 'new' | 'due';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type PaymentModel = Model<IPayment, Record<string, unknown>>;
