import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IUserTracking extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  sessionId: string;
  startTimeInputDebt: Date;
  finishTimeInputDebt: Date;
  startTimeRadar: Date;
  startTimePlanner: Date;
  ocrUsed: boolean;
  editCount: number;
  deviceType: string;
  completedAll: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserTrackingSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    startTimeInputDebt: {
      type: Date,
      default: null,
    },
    finishTimeInputDebt: {
      type: Date,
      default: null,
    },
    startTimeRadar: {
      type: Date,
      default: null,
    },
    startTimePlanner: {
      type: Date,
      default: null,
    },
    ocrUsed: {
      type: Boolean,
      default: false,
    },
    editCount: {
      type: Number,
      default: 0,
    },
    deviceType: {
      type: String,
      default: "unknown",
    },
    completedAll: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserTracking ||
  mongoose.model<IUserTracking>("UserTracking", UserTrackingSchema);
