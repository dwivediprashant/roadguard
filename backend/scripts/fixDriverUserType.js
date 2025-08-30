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

const fixDriverUserType = async () => {
  try {
    await connectDB();
    
    // Update all users with userType 'driver' to 'worker'
    const result = await mongoose.connection.db.collection('users').updateMany(
      { userType: 'driver' },
      { $set: { userType: 'worker' } }
    );
    
    console.log(`Updated ${result.modifiedCount} users from 'driver' to 'worker'`);
    
    // List remaining users to verify
    const users = await mongoose.connection.db.collection('users').find({}, { projection: { email: 1, userType: 1 } }).toArray();
    console.log('Current users:', users);
    
  } catch (error) {
    console.error('Error fixing driver userType:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

fixDriverUserType();