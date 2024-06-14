import { Schema, model } from 'mongoose';
import { IPayment, PaymentModel } from './payment.interface';
import { paymentMethod, paymentType } from './payment.constant';


const PaymentSchema = new Schema<IPayment, PaymentModel>(
  {
    purchase: { type: String}, //BILLID of purchase
    sell: { type: String}, //BILLID of sell
    amount: { type: Number, required: true},
    discountAmount: { type: Number, required: true},
    discountPercent: { type: Number, required: true},
    paymentMethod: {
      type: String,
      enum: {
        values: paymentMethod,
        message: 'Payment method can not be `{VALUE}`',
      },
      required: true,
    },
    paymentType: {
      type: String,
      enum: {
        values: paymentType,
        message: 'Payment type can not be `{VALUE}`',
      },
      required: true,
    },
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

export const Payment = model<IPayment, PaymentModel>('Payment', PaymentSchema);
