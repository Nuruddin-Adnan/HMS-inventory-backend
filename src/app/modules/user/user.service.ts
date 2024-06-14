import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { role, status, userSearchableFields } from './user.constant';
import { IUser } from './user.interface';
import { User } from './user.model';
import { JwtPayload } from 'jsonwebtoken';
import fs from 'fs';

const getAllUsers = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IUser[]>> => {
  const conditions = searcher(filters, userSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = User.find(conditions)
    .populate('permission', 'name')
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number);

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    User.countDocuments(conditions),
  ]);

  const page = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findById(id)
    .populate('permission')
    .populate('createdBy')
    .populate('updatedBy');
  return result;
};

const updateUser = async (
  user: JwtPayload | null,
  id: string,
  payload: Partial<IUser>,
): Promise<IUser | null> => {
  //checking is user exist
  const isUserExist = await User.findOne({ _id: id });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (
    user?.role === 'admin' &&
    (isUserExist.role === 'admin' || isUserExist.role === 'super_admin')
  ) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'You are not permitted to update!',
    );
  }

  if (payload.role && !role.includes(payload.role)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user role');
  }
  if (payload.status && !status.includes(payload.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user status');
  }

  const result = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const updateSignature = async (
  id: string,
  payload: Partial<IUser>,
): Promise<IUser | null> => {
  const result = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteUser = async (id: string): Promise<IUser | null> => {
  const targetedData = await User.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }else {
    if (targetedData.signature) {
      const fileName = targetedData.signature;
      fs.access(`./src/uploads/${fileName}`, fs.constants.F_OK, err => {
        if (err) {
          // Handle the case where the file doesn't exist
          throw new Error(`File does not exist: ${err}`);
        } else {
          // remove the previous image
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fs.unlink(`./src/uploads/${fileName}`, (err: any) => {
              if (err) {
                throw new Error(`Can not delete previous image: ${err}`);
              }
            });
          } catch (error) {
            throw new Error(`Can not delete previous image: ${error}`);
          }
        }
      });
    }
  }

  const result = await User.findOneAndDelete({ _id: id });
  return result;
};

const getMyProfile = async (id: string): Promise<IUser | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not found');
  }
  const result = await User.findById(id).select('-createdBy');
  return result;
};

const updateMyProfile = async (
  id: string,
  payload: Partial<IUser>,
): Promise<IUser | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not found');
  }

  const result = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const UserService = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateSignature,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};
