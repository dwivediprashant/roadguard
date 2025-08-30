import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Store online workers in memory (in production, use Redis)
let onlineWorkers = new Set();

// Worker comes online
router.post('/online', authenticate, async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ error: 'Access denied. Worker only.' });
    }
    
    onlineWorkers.add(req.user._id.toString());
    
    res.json({ message: 'Worker status updated to online' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Worker goes offline
router.post('/offline', authenticate, async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ error: 'Access denied. Worker only.' });
    }
    
    onlineWorkers.delete(req.user._id.toString());
    
    res.json({ message: 'Worker status updated to offline' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get online workers
router.get('/online', async (req, res) => {
  try {
    res.json({ onlineWorkers: Array.from(onlineWorkers) });
  } catch (error) {
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