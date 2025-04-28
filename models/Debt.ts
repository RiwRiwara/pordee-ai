import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IDebt extends Document {
  userId: IUser['_id'];
  name: string;
  debtType: 'บัตรเครดิต' | 'สินเชื่อ' | string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  paymentDueDay: number;
  minimumPayment?: number;
  startDate?: Date;
  estimatedPayoffDate?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    debtType: { 
      type: String, 
      required: true,
      enum: ['บัตรเครดิต', 'สินเชื่อ', 'อื่นๆ']
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    remainingAmount: { 
      type: Number, 
      required: true 
    },
    interestRate: { 
      type: Number, 
      required: true 
    },
    paymentDueDay: { 
      type: Number, 
      required: true,
      min: 1,
      max: 31
    },
    minimumPayment: { 
      type: Number 
    },
    startDate: { 
      type: Date 
    },
    estimatedPayoffDate: { 
      type: Date 
    },
    notes: { 
      type: String 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.Debt || mongoose.model<IDebt>('Debt', DebtSchema);
