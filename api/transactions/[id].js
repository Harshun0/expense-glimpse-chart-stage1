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

  // Get the transaction ID from the URL
  const { id } = req.query;
  
  try {
    await connectToDB();
    
    // Update transaction
    if (req.method === 'PUT') {
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        req.body,
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
      const deletedTransaction = await Transaction.findByIdAndDelete(id);
      
      if (!deletedTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      return res.status(200).json({ message: 'Transaction deleted successfully' });
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