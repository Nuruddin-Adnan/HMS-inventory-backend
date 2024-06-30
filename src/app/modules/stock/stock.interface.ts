import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IProduct } from '../product/product.interface';

export type IStock = {
  _id: Types.ObjectId;
  product: Types.ObjectId | IProduct;
  productName: string;
  quantity: number;
  alertQuantity: number;
  totalSell: number;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type StockModel = Model<IStock, Record<string, unknown>>;
