import mongoose from 'mongoose';

// Cached connection promise
let cachedConnection = null;

// Connection function specifically optimized for serverless
const connectToDB = async () => {
  // If connection exists and is ready, use it
  if (cachedConnection && 
      mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }
  
  try {
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Important for serverless: set global configurations before connecting
    mongoose.set('strictQuery', true);
    
    // Create a new connection promise if we don't have one
    if (!cachedConnection) {
      console.log('Creating new MongoDB connection promise');
      cachedConnection = mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Set a reasonable timeout
        serverSelectionTimeoutMS: 10000,
        // This is critical for serverless environments
        bufferCommands: true,
      });
    }
    
    // Wait for the connection
    console.log('Awaiting MongoDB connection...');
    await cachedConnection;
    
    console.log('MongoDB connected successfully:', mongoose.connection.readyState);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedConnection = null;
    throw error;
  }
};

// Define Schema - outside handler to optimize cold starts
const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
}, { timestamps: true });

// Create model function - called after connection is established
const getTransactionModel = () => {
  try {
    // Try to reuse existing model
    return mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
  } catch (error) {
    // If error, create new model
    return mongoose.model('Transaction', TransactionSchema);
  }
};

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

  // Debug - Log the request details
  console.log(`API request: ${req.method} ${req.url}`);
  
  try {
    // Connect to MongoDB - wait for full connection
    console.log('Initial connection state:', mongoose.connection.readyState);
    await connectToDB();
    console.log('Final connection state:', mongoose.connection.readyState);
    
    // Get Transaction model - only after connection is established
    const Transaction = getTransactionModel();
    
    // GET all transactions
    if (req.method === 'GET') {
      console.log('Fetching all transactions');
      // Use exec() to ensure promise is returned
      const transactions = await Transaction.find().sort({ date: -1 }).exec();
      
      console.log(`Found ${transactions.length} transactions`);
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
      console.log('Creating new transaction');
      const transaction = new Transaction(req.body);
      const savedTransaction = await transaction.save();
      
      console.log('Transaction created:', savedTransaction._id);
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
      timestamps: new Date().toISOString(),
      connectionState: mongoose.connection ? mongoose.connection.readyState : 'no connection'
    });
  }
} 