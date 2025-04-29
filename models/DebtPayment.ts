import mongoose, { Schema, Document } from "mongoose";

import { IDebt } from "./Debt";

export interface IDebtPayment extends Document {
  debtId: IDebt["_id"];
  amount: number;
  paymentDate: Date;
  paymentType: "regular" | "extra" | "minimum";
  notes?: string;
  createdAt: Date;
}

const DebtPaymentSchema: Schema = new Schema(
  {
    debtId: {
      type: Schema.Types.ObjectId,
      ref: "Debt",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["regular", "extra", "minimum"],
      default: "regular",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.DebtPayment ||
  mongoose.model<IDebtPayment>("DebtPayment", DebtPaymentSchema);
