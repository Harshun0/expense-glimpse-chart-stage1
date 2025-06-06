import mongoose from 'mongoose';

// Track if we've connected to MongoDB
let isConnected = false;

// A more robust connection function
const connectToDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }
  
  try {
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Connect with more options
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    });
    
    isConnected = true;
    console.log("Successfully connected to MongoDB");
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
let Transaction;
try {
  // Try to get an existing model
  Transaction = mongoose.model('Transaction');
} catch (error) {
  // Or create a new one
  Transaction = mongoose.model('Transaction', TransactionSchema);
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the transaction ID from the URL
  const { id } = req.query;
  
  // Debug - Log request details
  console.log(`API request: ${req.method} ${req.url} - Transaction ID: ${id}`);
  
  try {
    // Try to connect to MongoDB
    await connectToDB();
    
    // Update transaction
    if (req.method === 'PUT') {
      console.log(`Updating transaction: ${id}`);
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      
      if (!updatedTransaction) {
        console.log(`Transaction not found: ${id}`);
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      console.log(`Transaction updated: ${id}`);
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
      console.log(`Deleting transaction: ${id}`);
      const deletedTransaction = await Transaction.findByIdAndDelete(id);
      
      if (!deletedTransaction) {
        console.log(`Transaction not found: ${id}`);
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      console.log(`Transaction deleted: ${id}`);
      return res.status(200).json({ message: 'Transaction deleted successfully' });
    }
    
    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error.message, error.stack);
    
    // Return a more detailed error response
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      mongodbUri: process.env.MONGODB_URI ? 'URI is defined' : 'URI is missing',
      timestamps: new Date().toISOString()
    });
  }
} 