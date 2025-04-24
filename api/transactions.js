// Use the native MongoDB driver directly rather than Mongoose
import { MongoClient, ObjectId } from 'mongodb';

// Connection URI
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// Cache connection
let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection across hot-reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each serverless function instance
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Helper for getting the database connection
async function getDB() {
  const client = await clientPromise;
  return client.db('finance-tracker'); // Replace with your actual database name
}

// Mapping for our transaction data
const mapTransaction = (doc) => ({
  id: doc._id.toString(),
  amount: doc.amount,
  date: doc.date,
  description: doc.description,
  type: doc.type
});

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

  try {
    console.log(`API request: ${req.method} ${req.url}`);
    
    // Get database connection
    const db = await getDB();
    const transactions = db.collection('transactions');
    
    // Route handlers
    if (req.method === 'GET') {
      console.log('Fetching all transactions');
      
      // Get all transactions sorted by date
      const result = await transactions.find({}).sort({ date: -1 }).toArray();
      console.log(`Found ${result.length} transactions`);
      
      return res.status(200).json({
        transactions: result.map(mapTransaction)
      });
    }
    
    if (req.method === 'POST') {
      console.log('Creating new transaction');
      
      // Parse request body
      const data = JSON.parse(req.body);
      
      // Validate required fields
      if (!data.amount || !data.description || !data.type) {
        return res.status(400).json({ 
          message: 'Missing required fields' 
        });
      }
      
      // Create new transaction document
      const newTransaction = {
        amount: parseFloat(data.amount),
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        type: data.type,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert into database
      const result = await transactions.insertOne(newTransaction);
      console.log('Transaction created with ID:', result.insertedId);
      
      return res.status(201).json({
        transaction: {
          id: result.insertedId.toString(),
          ...newTransaction,
          date: newTransaction.date.toISOString()
        }
      });
    }
    
    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('API error:', error);
    
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamps: new Date().toISOString()
    });
  }
} 