import mongoose, { Schema, Document } from 'mongoose';
import { Transaction as TransactionType } from '@/types/transaction';

// Define the transaction schema with mongoose
export interface TransactionDocument extends Document, Omit<TransactionType, 'id'> {
  // Override the id property from TransactionType with mongoose's _id
  _id: mongoose.Types.ObjectId;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
export default mongoose.models.Transaction || 
  mongoose.model<TransactionDocument>('Transaction', TransactionSchema); 