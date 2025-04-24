import mongoose from 'mongoose';

// MongoDB connection
let isConnected = false;

const connectToDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

// Define Schema
const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
}, { timestamps: true });

// Use existing model or create new one
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectToDB();
    
    if (req.method === 'GET') {
      const transactions = await Transaction.find().sort({ date: -1 });
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
    
    if (req.method === 'POST') {
      const transaction = new Transaction(req.body);
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
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
} 