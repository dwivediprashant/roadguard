import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createRootAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@roadguard.com' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(0);
    }

    // Create root admin user
    const adminUser = new User({
      firstName: 'Root',
      lastName: 'Administrator',
      email: 'admin@roadguard.com',
      phone: '+1234567890',
      password: 'Admin@123',
      userType: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Root admin user created successfully');
    console.log('📧 Email: admin@roadguard.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createRootAdmin();
