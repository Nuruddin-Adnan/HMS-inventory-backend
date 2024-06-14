import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IBrand } from '../brand/brand.interface';

export type ISupplier = {
  _id: Types.ObjectId;
  SUPID: string; //Supplier id auto generated
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contactNo: string;
  email: string;
  address: string;
  brand: Types.ObjectId | IBrand;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type SupplierModel = Model<ISupplier, Record<string, unknown>>;
