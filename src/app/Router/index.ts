import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { PermissionRoutes } from '../modules/permission/permission.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { RefundRoutes } from '../modules/refund/refund.route';
import { ExpenseRoutes } from '../modules/expense/expense.route';
import { ShelveRoutes } from '../modules/shelve/shelve.route';
import { BrandRoutes } from '../modules/brand/brand.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { SupplierRoutes } from '../modules/supplier/supplier.route';
import { CustomerRoutes } from '../modules/customer/customer.route';
import { ProductRoutes } from '../modules/product/product.route';
import { StockRoutes } from '../modules/stock/stock.route';
import { PurchaseRoutes } from '../modules/purchase/purchase.route';
import { GenericRoutes } from '../modules/generic/generic.route';
import { OrderRoutes } from '../modules/order/order.route';
import { OrderItemRoutes } from '../modules/order-item/orderItem.route';

const router = express.Router();

const moduleRoutes = [
  { path: '/permissions', route: PermissionRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/shelves', route: ShelveRoutes },
  { path: '/brands', route: BrandRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/generics', route: GenericRoutes },
  { path: '/suppliers', route: SupplierRoutes },
  { path: '/customers', route: CustomerRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/stocks', route: StockRoutes },
  { path: '/purchases', route: PurchaseRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/refunds', route: RefundRoutes },
  { path: '/expenses', route: ExpenseRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/order-items', route: OrderItemRoutes },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
