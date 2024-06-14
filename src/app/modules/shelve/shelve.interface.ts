import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IShelve = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type ShelveModel = Model<IShelve, Record<string, unknown>>;
