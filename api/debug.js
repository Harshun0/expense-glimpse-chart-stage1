import mongoose from 'mongoose';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // Check if MongoDB URI is defined
    const hasMongoURI = !!process.env.MONGODB_URI;
    
    // Try to establish a test connection (without actually connecting)
    let connectionStatus = 'Not attempted';
    let connectionError = null;
    
    if (hasMongoURI) {
      try {
        // Check current connection state
        const currentState = mongoose.connection.readyState;
        
        // Map states to readable format
        const states = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting',
          99: 'uninitialized'
        };
        
        connectionStatus = states[currentState] || 'unknown';
        
        // If not connected, try to connect
        if (currentState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Reduce timeout for faster response
            bufferCommands: false,
          });
          connectionStatus = 'connected';
        }
      } catch (error) {
        connectionStatus = 'failed';
        connectionError = error.message;
      }
    }
    
    // Return diagnostic information
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV || 'not set',
        vercel_env: process.env.VERCEL_ENV || 'not set',
        region: process.env.VERCEL_REGION || 'not set',
      },
      mongodb: {
        uri_defined: hasMongoURI,
        connection_status: connectionStatus,
        error: connectionError,
        mongoose_version: mongoose.version,
      },
      request: {
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers.host,
          user_agent: req.headers['user-agent'],
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 