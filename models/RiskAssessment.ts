import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IRiskFactor {
  name: string;
  value: number;
  level: 'ต่ำ' | 'กลาง' | 'สูง';
}

export interface IRiskAssessment extends Document {
  userId: IUser['_id'];
  riskFactors: IRiskFactor[];
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RiskFactorSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  value: { 
    type: Number, 
    required: true 
  },
  level: { 
    type: String, 
    enum: ['ต่ำ', 'กลาง', 'สูง'],
    required: true 
  }
}, { _id: false });

const RiskAssessmentSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    riskFactors: [RiskFactorSchema],
    assessmentDate: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.RiskAssessment || 
  mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);
