import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TransactionModel from './models/Transaction.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Get the current file's path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// API Routes

// GET all transactions
app.get('/api/transactions', async (req, res) => {
  try {
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve the static files from the dist directory
  app.use(express.static(join(__dirname, '..', 'dist')));
  
  // Handles any requests that don't match the ones above
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 