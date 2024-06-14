import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ExpenseController } from './expense.controller';
import { ExpenseValidation } from './expense.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create-expense',
  auth(
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
  ),
  validateRequest(ExpenseValidation.createExpenseZodSchema),
  ExpenseController.createExpense,
);

router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
  ),
  ExpenseController.getSingleExpense,
);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
  ),
  validateRequest(ExpenseValidation.updateExpenseZodSchema),
  ExpenseController.updateExpense,
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  ExpenseController.deleteExpense,
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
  ExpenseController.getAllExpenses,
);

export const ExpenseRoutes = router;
