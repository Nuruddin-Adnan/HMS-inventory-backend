import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { ICategory } from '../category/category.interface';

export type IProduct = {
  _id: Types.ObjectId;
  tag: string; //Product tag auto generated
  code: string; //Get from product
  name: string;
  category: Types.ObjectId | ICategory;
  genericName: string;
  brand: string;
  shelve: string;
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
