import mongoose, { Schema, Document } from "mongoose";

import { IUser } from "./User";
import { IDebt } from "./Debt";

// Interface for debt items in the plan
export interface IDebtPlanItem extends Document {
  debtId: IDebt["_id"];
  name: string;
  debtType: string;
  originalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  paymentOrder: number;
}

// Main DebtPlan interface
export interface IDebtPlan extends Document {
  userId: IUser["_id"];
  goalType: string;
  paymentStrategy: string;
  monthlyPayment: number;
  timeInMonths: number;
  debtTypeId: string;
  debtItems: IDebtPlanItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for debt items in the plan
const DebtPlanItemSchema: Schema = new Schema({
  debtId: {
    type: Schema.Types.ObjectId,
    ref: "Debt",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  debtType: {
    type: String,
    required: true,
  },
  originalAmount: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  minimumPayment: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentOrder: {
    type: Number,
    required: true,
    default: 1,
  },
});

// Main DebtPlan schema
const DebtPlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalType: {
      type: String,
      required: true,
      enum: ["เห็นผลเร็ว", "สมดุล", "ประหยัดดอกเบี้ย"],
    },
    paymentStrategy: {
      type: String,
      required: true,
      enum: ["Snowball", "Avalanche", "Proportional"],
    },
    monthlyPayment: {
      type: Number,
      required: true,
    },
    timeInMonths: {
      type: Number,
      required: true,
    },
    debtTypeId: {
      type: String,
      required: true,
    },
    debtItems: {
      type: [DebtPlanItemSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.DebtPlan ||
  mongoose.model<IDebtPlan>("DebtPlan", DebtPlanSchema);
