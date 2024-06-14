import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type ICustomer = {
  _id: Types.ObjectId;
  CUSID: string; //Customer id auto generated
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contactNo: string;
  email: string;
  address: string;
  points: number;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type CustomerModel = Model<ICustomer, Record<string, unknown>>;
