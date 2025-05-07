import mongoose, { Schema, Document } from "mongoose";

import { IUser } from "./User";

export interface IUserTracking extends Document {
  userId: mongoose.Types.ObjectId | string | IUser;
  sessionId: string;
  isAnonymous: boolean;
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
      type: String,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
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
  },
);

export default mongoose.models.UserTracking ||
  mongoose.model<IUserTracking>("UserTracking", UserTrackingSchema);
