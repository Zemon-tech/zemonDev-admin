import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let academyConnection: mongoose.Connection | null = null;

export const connectAcademyDB = async (): Promise<mongoose.Connection> => {
  if (academyConnection && academyConnection.readyState === 1) {
    return academyConnection;
  }

  const uri = process.env.ACADEMY_MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('ACADEMY_MONGO_URI not set');
  }

  // Use a separate connection to keep academy data on its own cluster
  const conn = await mongoose.createConnection(uri).asPromise();
  academyConnection = conn;
  return conn;
};

export const getAcademyConnection = (): mongoose.Connection => {
  if (!academyConnection) {
    throw new Error('Academy DB not connected. Call connectAcademyDB() first.');
  }
  return academyConnection;
};




