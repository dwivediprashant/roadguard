import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Workers route is working!' });
});

// Store logged-in workers with timestamps
export let loggedInWorkers = new Map(); // userId -> { loginTime, lastActivity }

// Keep workers logged in - only remove on explicit logout
// Update activity when workers are active
router.post('/activity', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (loggedInWorkers.has(userId)) {
      loggedInWorkers.set(userId, {
        ...loggedInWorkers.get(userId),
        lastActivity: Date.now()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track worker login
router.post('/login', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Add worker to logged-in list
    loggedInWorkers.set(userId, {
      loginTime: Date.now(),
      lastActivity: Date.now()
    });
    
    console.log(`Worker logged in: ${userId}`);
    res.json({ message: 'Worker login tracked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track worker logout
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId && loggedInWorkers.has(userId)) {
      loggedInWorkers.delete(userId);
      console.log(`Worker logged out: ${userId}`);
    }
    
    res.json({ message: 'Worker logout tracked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logged-in workers
router.get('/logged-in', async (req, res) => {
  try {
    console.log('=== LOGGED-IN WORKERS DEBUG ===');
    console.log('Map size:', loggedInWorkers.size);
    console.log('Map contents:', Array.from(loggedInWorkers.entries()));
    
    const loggedInUserIds = Array.from(loggedInWorkers.keys());
    console.log('Logged-in user IDs:', loggedInUserIds);
    
    if (loggedInUserIds.length === 0) {
      console.log('No logged-in workers found');
      return res.json({ workers: [] });
    }
    
    // Get worker details from database
    const workers = await User.find({
      _id: { $in: loggedInUserIds },
      userType: 'worker'
    }).select('firstName lastName email phone');
    
    console.log('Found workers in DB:', workers);
    console.log('================================');
    
    res.json({ workers });
  } catch (error) {
    console.error('Error in logged-in workers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get logged-in workers with details
router.get('/online-details', async (req, res) => {
  try {
    const loggedInUserIds = Array.from(loggedInWorkers.keys());
    console.log('Logged-in worker IDs:', loggedInUserIds);
    
    if (loggedInUserIds.length === 0) {
      return res.json({ workers: [] });
    }
    
    // Get worker details from database
    const workers = await User.find({
      _id: { $in: loggedInUserIds },
      userType: 'worker'
    }).select('firstName lastName email phone');
    
    console.log('Found logged-in workers:', workers);
    res.json({ workers });
  } catch (error) {
    console.error('Error getting logged-in workers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all workers for a shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const workers = await User.find({ 
      userType: 'worker', 
      shopId: shopId 
    }).select('firstName lastName email phone');
    
    // Add online status to each worker
    const workersWithStatus = workers.map(worker => ({
      ...worker.toObject(),
      isOnline: onlineWorkers.has(worker._id.toString())
    }));
    
    res.json(workersWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;