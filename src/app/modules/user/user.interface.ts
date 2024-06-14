/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export type IUser = {
  _id: Types.ObjectId;
  password: string;
  role:
    | 'super_admin'
    | 'admin'
    | 'director_admin'
    | 'account_admin'
    | 'rent_collector'
    | 'doctor'
    | 'nurse'
    | 'report_processor'
    | 'technologist'
    | 'pharmacist'
    | 'pharmacy_incharge'
    | 'general_user'
    | 'receptionist'
    | 'lis';
  permission: Types.ObjectId[];
  name: string;
  phoneNumber: string;
  email: string;
  imgPath: string;
  address: string;
  seal: string;
  signature: string;
  status: 'active' | 'deactive';
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser | null;
};

export type UserModel = {
  isUserExist(
    email: string,
  ): Promise<
    Pick<
      IUser,
      | '_id'
      | 'name'
      | 'email'
      | 'password'
      | 'role'
      | 'status'
      | 'permission'
    >
  >;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>;
} & Model<IUser>;
