import { Schema, model } from 'mongoose';
import { IStock, StockModel } from './stock.interface';

const StockSchema = new Schema<IStock, StockModel>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    productName: { type: String, trim: true, required: true, unique: true },
    quantity: { type: Number, required: true },
    alertQuantity: { type: Number, default: 10 },
    totalSell: { type: Number, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const Stock = model<IStock, StockModel>('Stock', StockSchema);
