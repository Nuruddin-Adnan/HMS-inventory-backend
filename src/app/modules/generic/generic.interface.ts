import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IGeneric = {
  _id: Types.ObjectId;
  name: string;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type GenericModel = Model<IGeneric, Record<string, unknown>>;
