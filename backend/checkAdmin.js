import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@roadguard.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('ID:', adminUser._id);
      console.log('Name:', adminUser.firstName, adminUser.lastName);
      console.log('Email:', adminUser.email);
      console.log('UserType:', adminUser.userType);
      console.log('IsActive:', adminUser.isActive);
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkAdmin();
