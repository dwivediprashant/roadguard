import express from 'express';
import Task from '../models/Task.js';
import Worker from '../models/Worker.js';
import { authenticate } from '../middleware/auth.js';
import { authenticateWorker } from '../middleware/workerAuth.js';

const router = express.Router();

// Get worker profile and status
router.get('/profile', authenticateWorker, async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id }).populate('userId');
    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update worker availability
router.put('/availability', authenticateWorker, async (req, res) => {
  try {
    const { availability } = req.body;
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );
    res.json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get assigned tasks with filters and sorting
router.get('/tasks', authenticateWorker, async (req, res) => {
  try {
    const { category, status, sortBy = 'createdAt', order = 'desc', search } = req.query;
    
    let query = { assignedWorker: req.user._id };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { serviceType: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    if (sortBy === 'recent') {
      sortOption = { createdAt: order === 'desc' ? -1 : 1 };
    } else if (sortBy === 'upvotes') {
      sortOption = { upvotes: order === 'desc' ? -1 : 1 };
    }

    const tasks = await Task.find(query).sort(sortOption);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task details
router.get('/tasks/:id', authenticateWorker, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      assignedWorker: req.user._id 
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task status
router.put('/tasks/:id/status', authenticateWorker, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedWorker: req.user._id },
      { status },
      { new: true }
    );
    
    // Auto-generate invoice when task is completed
    if (status === 'completed') {
      task.invoice = {
        generated: true,
        invoiceId: `INV-${Date.now()}`,
        generatedAt: new Date()
      };
      await task.save();
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add note to task
router.post('/tasks/:id/notes', authenticateWorker, async (req, res) => {
  try {
    const { message } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedWorker: req.user._id },
      { $push: { notes: { message, sender: 'worker' } } },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update live location
router.put('/tasks/:id/location', authenticateWorker, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedWorker: req.user._id },
      { 
        liveLocation: { lat, lng, lastUpdated: new Date() }
      },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;