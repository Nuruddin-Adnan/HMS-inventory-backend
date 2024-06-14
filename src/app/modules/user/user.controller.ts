/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import queryFilters from '../../../shared/queryFilters';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from './user.interface';
import { UserService } from './user.service';
import { User } from './user.model';
import { deleteRequestFiles } from '../../../helpers/deleteRequestFiles';
import fs from 'fs';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = queryFilters(
    req.query as Record<string, string | undefined>,
    req,
  );
  const result = await UserService.getAllUsers(
    filters.filters,
    filters.queries,
  );
  sendResponse<IUser[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getSingleUser(id);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully !',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (req.body.role === 'admin' && req.user?.role !== 'super_admin') {
    throw new Error('You are not authorize to update admin');
  }

  const { id } = req.params;
  const user = req.user;

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { createdBy, password, ...updatedData } = req.body;
  updatedData.updatedBy = req.user?._id;
  const result = await UserService.updateUser(user, id, updatedData);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully !',
    data: result,
  });
});

const updateSignature = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.file) {
    throw new Error('Please upload a signature!');
  }

  const targetedData = await User.findById(id);

  if (!targetedData) {
    deleteRequestFiles(req);
    throw new Error('No user found!');
  }

  if (
    (targetedData.role === 'admin' || targetedData.role === 'super_admin') &&
    req.user?.role !== 'super_admin'
  ) {
    deleteRequestFiles(req);
    throw new Error('You are not authorized!');
  }

  if (targetedData.signature) {
    const fileName = targetedData.signature;
    fs.access(`./src/uploads/${fileName}`, fs.constants.F_OK, err => {
      if (err) {
        // Handle the case where the file doesn't exist
        throw new Error(`File does not exist: ${err}`);
      } else {
        // remove the previous image
        try {
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

  const updatedData = {
    updatedBy: req.user?._id,
    signature: `${req?.file?.fieldname}/${req?.file?.filename}`,
  };

  const result = await UserService.updateSignature(id, updatedData);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully!',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully !',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?._id;
  const result = await UserService.getMyProfile(id);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully !',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?._id;
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { password, email, role, status, permission, ...updatedData } =
    req.body;
  const result = await UserService.updateMyProfile(id, updatedData);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully !',
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateSignature,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};
