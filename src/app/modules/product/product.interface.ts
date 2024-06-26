import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { ICategory } from '../category/category.interface';
import { IShelve } from '../shelve/shelve.interface';

export type IProduct = {
  _id: Types.ObjectId;
  code: string; //Product code auto generated
  name: string;
  category: Types.ObjectId | ICategory;
  genericName: string;
  brand: string;
  shelve: Types.ObjectId | IShelve | null;
  description: string;
  unit: string;
  price: number;
  discountPercent: number;
  discountAmount: number;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type ProductModel = Model<IProduct, Record<string, unknown>>;
