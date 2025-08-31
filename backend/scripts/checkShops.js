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

const checkShops = async () => {
  try {
    await connectDB();
    
    console.log('=== ALL SHOPS ===');
    const shops = await Shop.find({}).populate('adminId', 'firstName lastName email');
    shops.forEach(shop => {
      console.log(`Shop: ${shop.shopName} (ID: ${shop.shopId})`);
      console.log(`Admin: ${shop.adminId?.firstName} ${shop.adminId?.lastName} (${shop.adminId?.email})`);
      console.log(`Active: ${shop.isActive}`);
      console.log('---');
    });
    
    console.log('=== ALL USERS ===');
    const users = await User.find({});
    users.forEach(user => {
      console.log(`${user.firstName} ${user.lastName} (${user.email}) - ${user.userType}`);
      if (user.shopId) console.log(`  Shop ID: ${user.shopId}`);
    });
    
  } catch (error) {
    console.error('Error checking shops:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

checkShops();