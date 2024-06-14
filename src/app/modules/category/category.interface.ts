import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type ICategory = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type CategoryModel = Model<ICategory, Record<string, unknown>>;
