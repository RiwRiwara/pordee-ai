import mongoose, { Schema, Document } from "mongoose";

import { IUser } from "./User";

export interface ITransaction extends Document {
  userId: IUser["_id"];
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  transactionDate: Date;
  imageUrl?: string;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for faster queries
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ transactionDate: -1 });

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
