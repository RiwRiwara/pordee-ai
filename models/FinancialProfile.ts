import mongoose, { Schema, Document } from "mongoose";

import { IUser } from "./User";

export interface IFinancialProfile extends Document {
  userId: IUser["_id"];
  monthlyIncome: number;
  monthlyExpenses: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    monthlyIncome: {
      type: Number,
      default: 0,
    },
    monthlyExpenses: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "THB",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.FinancialProfile ||
  mongoose.model<IFinancialProfile>("FinancialProfile", FinancialProfileSchema);
