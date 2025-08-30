import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js';
import User from './models/User.js';

dotenv.config();

const createSampleRequests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Get a user to associate with requests
    const user = await User.findOne({ email: 'admin@roadguard.com' });
    if (!user) {
      console.log('❌ No admin user found. Please create admin user first.');
      process.exit(1);
    }

    // Check if requests already exist
    const existingRequests = await Request.find();
    if (existingRequests.length > 0) {
      console.log('✅ Sample requests already exist');
      process.exit(0);
    }

    // Create sample requests
    const sampleRequests = [
      {
        userId: user._id,
        customer: 'John Smith',
        service: 'Tire Change',
        location: '123 Main St, Downtown',
        status: 'pending',
        comments: 'Flat tire on front left'
      },
      {
        userId: user._id,
        customer: 'Sarah Johnson',
        service: 'Battery Jump',
        location: '456 Oak Ave, Midtown',
        status: 'assigned',
        assignedWorker: 'Mike Johnson',
        comments: 'Car won\'t start, battery seems dead'
      },
      {
        userId: user._id,
        customer: 'Michael Brown',
        service: 'Fuel Delivery',
        location: '789 Pine Rd, Uptown',
        status: 'completed',
        assignedWorker: 'Sarah Davis',
        comments: 'Ran out of gas on highway'
      },
      {
        userId: user._id,
        customer: 'Emily Wilson',
        service: 'Lockout Service',
        location: '321 Elm St, Downtown',
        status: 'pending',
        comments: 'Keys locked inside car'
      },
      {
        userId: user._id,
        customer: 'David Lee',
        service: 'Towing Service',
        location: '654 Maple Dr, Suburbs',
        status: 'assigned',
        assignedWorker: 'Tom Brown',
        comments: 'Engine overheated, need towing to mechanic'
      }
    ];

    await Request.insertMany(sampleRequests);
    console.log('✅ Sample requests created successfully');
    console.log(`📊 Created ${sampleRequests.length} sample requests`);

  } catch (error) {
    console.error('❌ Error creating sample requests:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSampleRequests();
