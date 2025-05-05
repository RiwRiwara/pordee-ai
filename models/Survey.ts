import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

// Interface for survey responses
export interface ISurveyResponse extends Document {
  userId: IUser["_id"];
  appUsabilityRating: number; // 1-5 rating
  appUsabilityComment?: string;
  debtInputUnderstandingRating: number; // 1-5 rating
  debtInputUnderstandingComment?: string;
  radarUnderstandingRating: number; // 1-5 rating
  radarUnderstandingComment?: string;
  debtPlanHelpfulnessRating: number; // 1-5 rating
  debtPlanHelpfulnessComment?: string;
  additionalFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Survey schema
const SurveyResponseSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.Mixed, // Allow both ObjectId and string IDs
      ref: "User",
      required: true,
    },
    appUsabilityRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    appUsabilityComment: {
      type: String,
      required: false,
    },
    debtInputUnderstandingRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    debtInputUnderstandingComment: {
      type: String,
      required: false,
    },
    radarUnderstandingRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    radarUnderstandingComment: {
      type: String,
      required: false,
    },
    debtPlanHelpfulnessRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    debtPlanHelpfulnessComment: {
      type: String,
      required: false,
    },
    additionalFeedback: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the model
export default mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>("SurveyResponse", SurveyResponseSchema);
