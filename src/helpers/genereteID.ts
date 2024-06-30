import { ICustomer } from '../app/modules/customer/customer.interface';
import { Customer } from '../app/modules/customer/customer.model';
import { IOrder } from '../app/modules/order/order.interface';
import { Order } from '../app/modules/order/order.model';
import { IProduct } from '../app/modules/product/product.interface';
import { Product } from '../app/modules/product/product.model';
import { IPurchase } from '../app/modules/purchase/purchase.interface';
import { Purchase } from '../app/modules/purchase/purchase.model';
import { ISupplier } from '../app/modules/supplier/supplier.interface';
import { Supplier } from '../app/modules/supplier/supplier.model';

// Custom function to generate the supplier ID
export const generateSUPID = async () => {
  const currentYear: number = new Date().getFullYear();

  // Set the time  for both startDate and endDate
  const startDate: Date = new Date(currentYear, 0, 1, 0, 0, 0, 0);
  const endDate: Date = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  let SUPID;

  const lastCollection: ISupplier[] | null = await Supplier.find({
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ SUPID: -1 })
    .limit(1)
    .exec();

  if (lastCollection.length > 0) {
    SUPID = parseInt(lastCollection[0].SUPID) + 1;
  } else {
    SUPID = `${new Date().getFullYear().toString().substring(2)}000001`;
  }

  return SUPID;
};

// Custom function to generate the customer ID
export const generateCUSID = async () => {
  const currentYear: number = new Date().getFullYear();

  // Set the time  for both startDate and endDate
  const startDate: Date = new Date(currentYear, 0, 1, 0, 0, 0, 0);
  const endDate: Date = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  let CUSID;

  const lastCollection: ICustomer[] | null = await Customer.find({
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ CUSID: -1 })
    .limit(1)
    .exec();

  if (lastCollection.length > 0) {
    CUSID = parseInt(lastCollection[0].CUSID) + 1;
  } else {
    CUSID = `${new Date().getFullYear().toString().substring(2)}000001`;
  }

  return CUSID;
};

// Custom function to generate the product tag
export const generateProductTag = async () => {
  const currentYear: number = new Date().getFullYear();

  // Set the time  for both startDate and endDate
  const startDate: Date = new Date(currentYear, 0, 1, 0, 0, 0, 0);
  const endDate: Date = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  let tag;

  const lastCollection: IProduct[] | null = await Product.find({
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ tag: -1 })
    .limit(1)
    .exec();

  if (lastCollection.length > 0) {
    tag = parseInt(lastCollection[0].tag) + 1;
  } else {
    tag = `${new Date().getFullYear().toString().substring(2)}000001`;
  }

  return tag;
};

// Custom function to generate the purchase id
export const generatePURCHASEID = async () => {
  const currentYear: number = new Date().getFullYear();

  // Set the time  for both startDate and endDate
  const startDate: Date = new Date(currentYear, 0, 1, 0, 0, 0, 0);
  const endDate: Date = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  let BILLID;

  const lastCollection: IPurchase[] | null = await Purchase.find({
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ BILLID: -1 })
    .limit(1)
    .exec();

  if (lastCollection.length > 0) {
    BILLID = parseInt(lastCollection[0].BILLID) + 1;
  } else {
    BILLID = `${new Date().getFullYear().toString().substring(2)}000001`;
  }

  return BILLID;
};

// Custom function to generate the Order ID
export const generateORDERID = async () => {
  const currentYear: number = new Date().getFullYear();

  // Set the time  for both startDate and endDate
  const startDate: Date = new Date(currentYear, 0, 1, 0, 0, 0, 0);
  const endDate: Date = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  let BILLID;

  const lastCollection: IOrder[] | null = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ BILLID: -1 })
    .limit(1)
    .exec();

  if (lastCollection.length > 0) {
    BILLID = parseInt(lastCollection[0].BILLID) + 1;
  } else {
    BILLID = `${new Date().getFullYear().toString().substring(2)}000001`;
  }

  return BILLID;
};