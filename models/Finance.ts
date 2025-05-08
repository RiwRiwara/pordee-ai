import mongoose, { Schema, Document } from "mongoose";

export interface IFinance extends Document {
  userId: mongoose.Types.ObjectId;
  grossMonthlyIncome: number;  // รายได้รวมก่อนหักค่าใช้จ่าย/ภาษี
  monthlyIncome: number;       // รายได้สุทธิหลังหักค่าใช้จ่าย/ภาษี
  monthlyExpense: number;      // รายจ่ายรวม
  selectedPlan: "quick" | "save" | "balanced" | null;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    grossMonthlyIncome: {
      type: Number,
      required: true,
      default: 0,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      default: 0,
    },
    monthlyExpense: {
      type: Number,
      required: true,
      default: 0,
    },
    selectedPlan: {
      type: String,
      enum: ["quick", "save", "balanced", null],
      default: null,
    },
  },
  { timestamps: true },
);

// Create or get model
const Finance =
  mongoose.models.Finance || mongoose.model<IFinance>("Finance", FinanceSchema);

export default Finance;
