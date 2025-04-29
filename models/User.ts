import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  languagePreference: 'th' | 'en';
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  context?: string; // AI context storage
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    profileImageUrl: { type: String },
    languagePreference: { 
      type: String, 
      enum: ['th', 'en'], 
      default: 'th' 
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    context: {
      type: String,
      default: ''
    },
    lastLogin: {
      type: Date
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
