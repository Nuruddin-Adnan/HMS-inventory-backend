import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create-product',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
  ),
  validateRequest(ProductValidation.createProductZodSchema),
  ProductController.createProduct,
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
  ProductController.getSingleProduct,
);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.ACCOUNT_ADMIN,
    ENUM_USER_ROLE.STORE_INCHARGE,
  ),
  validateRequest(ProductValidation.updateProductZodSchema),
  ProductController.updateProduct,
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  ProductController.deleteProduct,
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
  ProductController.getAllProducts,
);

export const ProductRoutes = router;
