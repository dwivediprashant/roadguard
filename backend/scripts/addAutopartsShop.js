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

const addAutopartsShop = async () => {
  try {
    await connectDB();
    
    // Find the admin user
    const admin = await User.findOne({ email: 'auto@gmail.com' });
    
    if (!admin) {
      console.log('Admin user auto@gmail.com not found');
      return;
    }
    
    console.log('Found admin:', admin.firstName, admin.lastName);
    
    // Check if shop already exists
    const existingShop = await Shop.findOne({ adminId: admin._id });
    
    if (existingShop) {
      console.log('Shop already exists:', existingShop.shopName);
      return;
    }
    
    // Generate unique shop ID
    let shopId;
    let shopExists;
    do {
      shopId = 'SH' + Math.random().toString(36).substr(2, 6).toUpperCase();
      shopExists = await Shop.findOne({ shopId });
    } while (shopExists);
    
    // Create the shop
    const shop = new Shop({
      shopId,
      shopName: 'AutoParts Workshop',
      adminId: admin._id,
      phone: admin.phone || '+1234567890',
      isActive: true
    });
    
    await shop.save();
    
    console.log(`Created shop: ${shop.shopName} with ID: ${shop.shopId}`);
    
    // Update admin user with shop name if not set
    if (!admin.shopName) {
      admin.shopName = 'AutoParts Workshop';
      await admin.save();
      console.log('Updated admin shopName');
    }
    
  } catch (error) {
    console.error('Error adding autoparts shop:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

addAutopartsShop();