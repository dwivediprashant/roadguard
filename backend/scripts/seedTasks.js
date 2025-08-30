import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/Task.js';
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

const seedTasks = async () => {
  try {
    await connectDB();
    
    // Find admin and worker users
    const admin = await User.findOne({ userType: 'admin' });
    const worker = await User.findOne({ userType: 'worker' });
    
    if (!admin || !worker) {
      console.log('Admin or worker user not found. Please create users first.');
      return;
    }

    // Clear existing tasks
    await Task.deleteMany({});

    // Create sample tasks
    const tasks = [
      {
        title: 'Road Inspection - Main Street',
        description: 'Inspect road conditions on Main Street between 1st and 5th Avenue',
        assignedTo: worker._id,
        assignedBy: admin._id,
        shopId: 'SH123456',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'high',
        status: 'pending'
      },
      {
        title: 'Pothole Repair - Oak Avenue',
        description: 'Fill potholes on Oak Avenue near the school zone',
        assignedTo: worker._id,
        assignedBy: admin._id,
        shopId: 'SH123456',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        priority: 'medium',
        status: 'pending'
      },
      {
        title: 'Traffic Sign Maintenance',
        description: 'Check and clean all traffic signs in downtown area',
        assignedTo: worker._id,
        assignedBy: admin._id,
        shopId: 'SH123456',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'low',
        status: 'pending'
      },
      {
        title: 'Emergency Road Repair',
        description: 'Urgent repair needed on Highway 101 due to storm damage',
        assignedTo: worker._id,
        assignedBy: admin._id,
        shopId: 'SH123456',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        priority: 'high',
        status: 'completed',
        completedAt: new Date(),
        comments: [
          {
            text: 'Started working on this task early morning',
            addedBy: worker._id,
            addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            text: 'Task completed successfully. Road is now safe for traffic.',
            addedBy: worker._id,
            addedAt: new Date()
          }
        ]
      }
    ];

    await Task.insertMany(tasks);
    console.log(`Created ${tasks.length} sample tasks`);
    
  } catch (error) {
    console.error('Error seeding tasks:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedTasks();