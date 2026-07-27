import mongoose from 'mongoose';

const DEFAULT_ATLAS_URI = 'mongodb+srv://saumyrajpoot666_db_user:NP8tXALxPLhalnIN@cluster0.z8gouio.mongodb.net/nyaya_lipi?retryWrites=true&w=majority';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
  
  // Disable query buffering so disconnected operations fail instantly with clear status
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      tlsInsecure: true,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] Atlas Connection Warning. Retrying fallback URI...', error);
    try {
      const connFallback = await mongoose.connect(DEFAULT_ATLAS_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`[MongoDB Fallback] Connected successfully to host: ${connFallback.connection.host}`);
    } catch (fallbackErr) {
      console.error('[MongoDB Fallback Failure]:', fallbackErr);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected. Reconnection will be handled automatically.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});
