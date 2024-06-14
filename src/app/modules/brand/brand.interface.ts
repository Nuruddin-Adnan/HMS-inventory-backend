import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IBrand = {
  _id: Types.ObjectId;
  name: string;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type BrandModel = Model<IBrand, Record<string, unknown>>;
