import express from 'express';
import { RefundController } from './refund.controller';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RefundValidation } from './refund.validation';

const router = express.Router();

router.patch(
  '/create-order-refund/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
  ),
  validateRequest(RefundValidation.createOrderRefundZodSchema),
  RefundController.createOrderRefund,
);

router.get(
  '/get-total-refund',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
    ENUM_USER_ROLE.SALESMAN,
    ENUM_USER_ROLE.GENERAL_USER,
  ),
  RefundController.getTotalRefund,
);

router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
    ENUM_USER_ROLE.SALESMAN,
    ENUM_USER_ROLE.GENERAL_USER,
  ),
  RefundController.getSingleRefund,
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
  RefundController.getAllRefunds,
);

export const RefundRoutes = router;
