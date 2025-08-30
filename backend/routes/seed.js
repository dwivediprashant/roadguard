import express from 'express';
import Task from '../models/Task.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';

const router = express.Router();

// Seed sample data for development
router.post('/sample-data', async (req, res) => {
  try {
    // Create sample user if not exists
    let regularUser = await User.findOne({ email: 'user@roadguard.com' });
    if (!regularUser) {
      regularUser = new User({
        firstName: 'Jane',
        lastName: 'User',
        email: 'user@roadguard.com',
        phone: '+1234567891',
        password: 'password123',
        userType: 'user'
      });
      await regularUser.save();
    }

    // Create sample worker user if not exists
    let workerUser = await User.findOne({ email: 'worker@roadguard.com' });
    if (!workerUser) {
      workerUser = new User({
        firstName: 'John',
        lastName: 'Worker',
        email: 'worker@roadguard.com',
        phone: '+1234567890',
        password: 'password123',
        userType: 'worker'
      });
      await workerUser.save();
    }

    // Create worker profile
    let worker = await Worker.findOne({ userId: workerUser._id });
    if (!worker) {
      worker = new Worker({
        userId: workerUser._id,
        availability: 'available',
        skills: ['Battery Jump', 'Tire Change', 'Fuel Delivery', 'Towing'],
        rating: 4.8,
        completedTasks: 156
      });
      await worker.save();
    }

    // Sample tasks
    const sampleTasks = [
      {
        title: 'Emergency Battery Jump Service',
        description: 'Customer vehicle won\'t start due to dead battery. Located in downtown parking garage.',
        clientName: 'John Doe',
        clientPhone: '+1 (555) 123-4567',
        serviceType: 'Battery Jump',
        category: 'Emergency',
        location: {
          address: 'Main St & 5th Ave, Downtown',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        scheduledTime: new Date('2024-01-15T10:00:00Z'),
        status: 'assigned',
        assignedWorker: workerUser._id,
        quotation: {
          baseCost: 75,
          additionalCosts: [{ item: 'Emergency surcharge', cost: 25 }],
          totalCost: 100
        },
        priority: 'high',
        distance: 2.5,
        upvotes: 12
      },
      {
        title: 'Tire Replacement Service',
        description: 'Flat tire needs replacement. Customer has spare tire available.',
        clientName: 'Jane Smith',
        clientPhone: '+1 (555) 234-5678',
        serviceType: 'Tire Change',
        category: 'Maintenance',
        location: {
          address: 'Oak Rd & Pine St, Suburbs',
          coordinates: { lat: 40.7589, lng: -73.9851 }
        },
        scheduledTime: new Date('2024-01-15T14:00:00Z'),
        status: 'start_service',
        assignedWorker: workerUser._id,
        quotation: {
          baseCost: 50,
          additionalCosts: [],
          totalCost: 50
        },
        priority: 'medium',
        distance: 5.2,
        upvotes: 8
      },
      {
        title: 'Fuel Delivery Service',
        description: 'Vehicle ran out of gas on highway. Need 5 gallons of regular gasoline.',
        clientName: 'Bob Wilson',
        clientPhone: '+1 (555) 345-6789',
        serviceType: 'Fuel Delivery',
        category: 'Delivery',
        location: {
          address: 'Highway 101, Mile Marker 45',
          coordinates: { lat: 40.6892, lng: -74.0445 }
        },
        scheduledTime: new Date('2024-01-15T16:30:00Z'),
        status: 'reached',
        assignedWorker: workerUser._id,
        quotation: {
          baseCost: 40,
          additionalCosts: [{ item: 'Fuel cost (5 gallons)', cost: 20 }],
          totalCost: 60
        },
        priority: 'low',
        distance: 8.1,
        upvotes: 15
      }
    ];

    // Clear existing tasks and create new ones
    await Task.deleteMany({ assignedWorker: workerUser._id });
    await Task.insertMany(sampleTasks);

    res.json({ 
      message: 'Sample data created successfully',
      userId: regularUser._id,
      workerId: workerUser._id,
      tasksCreated: sampleTasks.length,
      credentials: {
        user: { email: 'user@roadguard.com', password: 'password123' },
        worker: { email: 'worker@roadguard.com', password: 'password123' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;