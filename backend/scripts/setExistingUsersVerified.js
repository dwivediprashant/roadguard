import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const setExistingUsersVerified = async () => {
  try {
    await connectDB();
    
    // Update all existing users to be verified
    const result = await mongoose.connection.db.collection('users').updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} users to verified status`);
    
  } catch (error) {
    console.error('Error setting users as verified:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

setExistingUsersVerified();