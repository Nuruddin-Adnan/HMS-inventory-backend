import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../user/user.interface';
import { ILoginUserResponse, IRefreshTokenResponse } from './auth.interface';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';
import { deleteRequestFiles } from '../../../helpers/deleteRequestFiles';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const targetedData = await User.findOne({ email: req.body?.email }).select(
    'email',
  );

  if (targetedData) {
    if (req.file) {
      deleteRequestFiles(req);
    }
    throw new Error('User already exist');
  }

  if (req.body.role === 'admin' && req.user?.role !== 'super_admin') {
    if (req.file) {
      deleteRequestFiles(req);
    }
    throw new Error('You are not authorize to create admin');
  }

  const payload = req.body;
  payload.createdBy = req.user?._id;

  if (req.file) {
    payload.signature = `${req?.file?.fieldname}/${req?.file?.filename}`;
  }

  // make the permission array if available or empty array
  if (req.body?.permission) {
    const permissionArray = req.body?.permission.split(',');
    payload.permission = permissionArray;
  } else {
    payload.permission = [];
  }

  const result = await AuthService.createUser(payload);

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { password, ...userData } = result;
  sendResponse<Partial<IUser>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully!',
    data: userData,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUser(loginData);
  const { refreshToken, ...others } = result;

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  const { accessToken } = others;

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('accessToken', accessToken, cookieOptions);

  sendResponse<ILoginUserResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully !',
    data: others,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear cookies on the client side
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logout successful!',
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully !',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;

  await AuthService.changePassword(user, passwordData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully !',
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const { ...passwordData } = req.body;

  await AuthService.resetPassword(user, id, passwordData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully !',
  });
});

export const AuthController = {
  createUser,
  loginUser,
  logoutUser,
  refreshToken,
  changePassword,
  resetPassword,
};
