import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from '../models/Shop.js';
import User from '../models/User.js';

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

const addAutopartsWorkers = async () => {
  try {
    await connectDB();
    
    // Find the AutoParts shop
    const shop = await Shop.findOne({ shopName: 'AutoParts Workshop' });
    
    if (!shop) {
      console.log('AutoParts Workshop not found');
      return;
    }
    
    console.log('Found shop:', shop.shopName, 'ID:', shop.shopId);
    
    // Create workers for AutoParts
    const workers = [
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@autoparts.com',
        phone: '+1234567801',
        password: 'password123',
        userType: 'worker',
        shopId: shop.shopId,
        isVerified: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah@autoparts.com',
        phone: '+1234567802',
        password: 'password123',
        userType: 'worker',
        shopId: shop.shopId,
        isVerified: true
      }
    ];
    
    for (const workerData of workers) {
      // Check if worker already exists
      const existingWorker = await User.findOne({ email: workerData.email });
      
      if (!existingWorker) {
        const worker = new User(workerData);
        await worker.save();
        console.log(`Created worker: ${worker.firstName} ${worker.lastName}`);
      } else {
        console.log(`Worker ${workerData.email} already exists`);
      }
    }
    
  } catch (error) {
    console.error('Error adding autoparts workers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

addAutopartsWorkers();