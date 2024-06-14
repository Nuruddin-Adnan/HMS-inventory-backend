import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
  IResetPassword,
} from './auth.interface';

const createUser = async (payload: IUser): Promise<IUser> => {
  const result = (await User.create(payload)).toObject();
  return result;
};

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  // const isUserExist = await User.isUserExist(email);
  const isUserExist = await User.isUserExist(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (isUserExist.status === 'deactive') {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'User is not deactivated. Please contact admin',
    );
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  //create access token & refresh token

  const {
    _id,
    name,
    role,
    email: emailAddress,
    permission,
    status,
  } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { _id, name, role, email: emailAddress, permission, status },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtHelpers.createToken(
    { _id, name, role, email: emailAddress, permission, status },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  // invalid token - synchronous
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { email } = verifiedToken;

  // tumi delete hye gso  kintu tumar refresh token ase
  // checking deleted user's refresh token

  const isUserExist = await User.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }
  //generate new token

  const newAccessToken = jwtHelpers.createToken(
    {
      _id: isUserExist._id,
      name: isUserExist.name,
      email: isUserExist.email,
      role: isUserExist.role,
      permission: isUserExist.permission,
      status: isUserExist.status,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );
  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword,
) => {
  const { oldPassword, newPassword } = payload;

  //checking is user exist
  const isUserExist = await User.findOne({ _id: user?._id }).select(
    '+password',
  );

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // checking old password
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is incorrect');
  }

  // // hash password before saving
  // const newHashedPassword = await bcrypt.hash(
  //   newPassword,
  //   Number(config.bycrypt_salt_rounds)
  // );

  // const query = { id: user?.userId };
  // const updatedData = {
  //   password: newHashedPassword,  //
  //   needsPasswordChange: false,
  //   passwordChangedAt: new Date(), //
  // };

  // await User.findOneAndUpdate(query, updatedData);
  // data update
  isUserExist.password = newPassword;

  // updating using save()
  const resullt = isUserExist.save();
  return resullt;
};

const resetPassword = async (
  user: JwtPayload | null,
  id: string,
  payload: IResetPassword,
) => {
  const { password } = payload;

  //checking is user exist
  const isUserExist = await User.findOne({ _id: id }).select('+password');

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (
    user?.role === 'admin' &&
    (isUserExist.role === 'admin' || isUserExist.role === 'super_admin')
  ) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'You are not permitted to reset password!',
    );
  }

  isUserExist.password = password;

  // updating using save()
  const resullt = isUserExist.save();
  return resullt;
};

export const AuthService = {
  createUser,
  loginUser,
  refreshToken,
  changePassword,
  resetPassword,
};
