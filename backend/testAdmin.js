import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

dotenv.config();

const testAdmin = async () => {
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
      
      // Test JWT token creation
      const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      console.log('✅ JWT Token created:', token);
      
      // Test JWT token verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT Token decoded:', decoded);
      
      // Test user lookup by ID
      const foundUser = await User.findById(decoded.userId).select('-password');
      console.log('✅ User found by ID:', foundUser ? 'YES' : 'NO');
      if (foundUser) {
        console.log('User details:', {
          id: foundUser._id,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          userType: foundUser.userType
        });
      }
      
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error testing admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testAdmin();
