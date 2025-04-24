import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined');
}

// MongoDB Schema and Model
const TransactionSchema = new mongoose.Schema(
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

// Create the model or use existing one
let TransactionModel;
try {
  TransactionModel = mongoose.model('Transaction');
} catch {
  TransactionModel = mongoose.model('Transaction', TransactionSchema);
}

// Connect to MongoDB
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// GET all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    await connectToDatabase();
    const transactions = await TransactionModel.find().sort({ date: -1 });
    res.json({ 
      transactions: transactions.map(doc => ({
        id: doc._id.toString(),
        amount: doc.amount,
        date: doc.date,
        description: doc.description,
        type: doc.type
      }))
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// POST new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    await connectToDatabase();
    const { amount, date, description, type } = req.body;
    const transaction = new TransactionModel({
      amount,
      date,
      description,
      type
    });
    
    const savedTransaction = await transaction.save();
    
    res.status(201).json({ 
      transaction: {
        id: savedTransaction._id.toString(),
        amount: savedTransaction.amount,
        date: savedTransaction.date,
        description: savedTransaction.description,
        type: savedTransaction.type
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

// PUT update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const { id } = req.params;
    const { amount, date, description, type } = req.body;
    
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      id,
      { amount, date, description, type },
      { new: true }
    );
    
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ 
      transaction: {
        id: updatedTransaction._id.toString(),
        amount: updatedTransaction.amount,
        date: updatedTransaction.date,
        description: updatedTransaction.description,
        type: updatedTransaction.type
      }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

// DELETE transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const { id } = req.params;
    
    const deletedTransaction = await TransactionModel.findByIdAndDelete(id);
    
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

// Fallback for other routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Export the Express API
export default app; 