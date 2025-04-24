import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

let cachedDb = null;

// MongoDB connection
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(); // Use default database from connection string
  
  cachedDb = db;
  return db;
}

// MongoDB Schema setup
const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
}, {
  timestamps: true,
});

let TransactionModel;
try {
  TransactionModel = mongoose.model('Transaction');
} catch (error) {
  TransactionModel = mongoose.model('Transaction', TransactionSchema);
}

// Handle different HTTP methods
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const path = pathname.replace(/^\/api/, '');
  
  try {
    // Health check
    if (path === '/health') {
      return res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    }

    // Connect to MongoDB with mongoose for ORM capabilities
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Routes for transactions
    if (path === '/transactions') {
      // GET all transactions
      if (req.method === 'GET') {
        const transactions = await TransactionModel.find().sort({ date: -1 });
        return res.status(200).json({
          transactions: transactions.map(doc => ({
            id: doc._id.toString(),
            amount: doc.amount,
            date: doc.date,
            description: doc.description,
            type: doc.type
          }))
        });
      }
      
      // POST new transaction
      if (req.method === 'POST') {
        const body = req.body;
        
        const transaction = new TransactionModel({
          amount: body.amount,
          date: body.date,
          description: body.description,
          type: body.type
        });
        
        const savedTransaction = await transaction.save();
        
        return res.status(201).json({
          transaction: {
            id: savedTransaction._id.toString(),
            amount: savedTransaction.amount,
            date: savedTransaction.date,
            description: savedTransaction.description,
            type: savedTransaction.type
          }
        });
      }
    }
    
    // Handle transaction by ID
    if (path.startsWith('/transactions/') && path.length > 14) {
      const id = path.slice(14); // Extract ID from path
      
      // Update transaction
      if (req.method === 'PUT') {
        const body = req.body;
        
        const updatedTransaction = await TransactionModel.findByIdAndUpdate(
          id,
          {
            amount: body.amount,
            date: body.date,
            description: body.description,
            type: body.type
          },
          { new: true }
        );
        
        if (!updatedTransaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
        
        return res.status(200).json({
          transaction: {
            id: updatedTransaction._id.toString(),
            amount: updatedTransaction.amount,
            date: updatedTransaction.date,
            description: updatedTransaction.description,
            type: updatedTransaction.type
          }
        });
      }
      
      // Delete transaction
      if (req.method === 'DELETE') {
        const deletedTransaction = await TransactionModel.findByIdAndDelete(id);
        
        if (!deletedTransaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
        
        return res.status(200).json({ message: 'Transaction deleted successfully' });
      }
    }
    
    // Route not found
    return res.status(404).json({ message: 'API route not found' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 