import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { notifyTaskAssigned } from '../services/notificationService.js';

const router = express.Router();

// Test route to create a task and send notification
router.post('/create-task', async (req, res) => {
  try {
    // Find a worker user
    const worker = await User.findOne({ userType: 'worker' });
    if (!worker) {
      return res.status(404).json({ error: 'No worker found' });
    }

    // Find an admin user
    const admin = await User.findOne({ userType: 'admin' });
    if (!admin) {
      return res.status(404).json({ error: 'No admin found' });
    }

    // Create a test task
    const task = new Task({
      title: 'Test Emergency Task',
      description: 'This is a test task to verify notifications work',
      assignedTo: worker._id,
      assignedBy: admin._id,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      priority: 'high',
      status: 'assigned'
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email');

    // Send notification
    const io = req.app.get('io');
    await notifyTaskAssigned(worker._id, populatedTask, io);

    res.json({ 
      message: 'Test task created and notification sent',
      task: populatedTask,
      worker: {
        id: worker._id,
        name: `${worker.firstName} ${worker.lastName}`,
        email: worker.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;