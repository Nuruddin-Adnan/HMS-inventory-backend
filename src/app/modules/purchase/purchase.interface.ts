import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IProduct } from '../product/product.interface';
import { ISupplier } from '../supplier/supplier.interface';

export type IPurchase = {
  _id: Types.ObjectId;
  BILLID: string; //Auto generated uniqe id
  supplier: Types.ObjectId | ISupplier;
  product: Types.ObjectId | IProduct;
  productName: string;
  lotNo: string;
  expiryDate: Date;
  unit: string;
  quantity: number;
  price: number;
  total: number;
  advance: number;
  due: number;
  refundQuantity: number;
  paymentStatus:
    | 'paid'
    | 'unpaid'
    | 'partial-paid'
    | 'partial-refund'
    | 'full-refund';
  refundBy: Types.ObjectId | IUser | null;
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type PurchaseModel = Model<IPurchase, Record<string, unknown>>;
