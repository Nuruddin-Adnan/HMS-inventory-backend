import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PermissionController } from './permission.controller';
import { PermissionValidation } from './permission.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create-permission',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(PermissionValidation.createPermissionZodSchema),
  PermissionController.createPermission,
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  PermissionController.getSinglePermission,
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(PermissionValidation.updatePermissionZodSchema),
  PermissionController.updatePermission,
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  PermissionController.deletePermission,
);

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
    ENUM_USER_ROLE.SALESMAN,
    ENUM_USER_ROLE.GENERAL_USER,
  ),
  PermissionController.getAllPermissions,
);

export const PermissionRoutes = router;
