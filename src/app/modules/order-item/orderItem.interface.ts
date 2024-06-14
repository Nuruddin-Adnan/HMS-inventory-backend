import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IProduct } from '../product/product.interface';

export type IOrderItem = {
  _id: Types.ObjectId;
  BILLID: string;
  product: Types.ObjectId | IProduct;
  unit: string;
  price: number;
  quantity: number;
  refundQuantity: number;
  orderStatus: 'pending' | 'confirmed' | 'picked' | 'delivered' | 'cancel' | 'partial-refund' | 'full-refund';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type OrderItemModel = Model<IOrderItem, Record<string, unknown>>;
