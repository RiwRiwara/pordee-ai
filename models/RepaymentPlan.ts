import mongoose, { Schema, Document } from "mongoose";

import { IUser } from "./User";

export interface IRepaymentPlan extends Document {
  userId: IUser["_id"];
  name: string;
  description: string;
  details: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RepaymentPlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      enum: ["Snowball", "Avalanche", "MVRP"],
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.RepaymentPlan ||
  mongoose.model<IRepaymentPlan>("RepaymentPlan", RepaymentPlanSchema);
