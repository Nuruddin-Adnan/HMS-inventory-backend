import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from '../user/user.validation';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { SignatureUploadHelper } from '../../../helpers/SignatureUploadHelper';
import { limiter } from '../../../shared/limiter';

const router = express.Router();

router.post(
  '/signup',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SignatureUploadHelper.upload.single('signature'),
  validateRequest(UserValidation.createUserZodSchema),
  AuthController.createUser,
);

router.post(
  '/login',
  limiter,
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser,
);

router.post('/logout', AuthController.logoutUser);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken,
);

router.post(
  '/change-password',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
    ENUM_USER_ROLE.SALESMAN,
    ENUM_USER_ROLE.GENERAL_USER,
  ),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePassword,
);

router.post(
  '/reset-password/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AuthValidation.resetPasswordZodSchema),
  AuthController.resetPassword,
);

export const AuthRoutes = router;
