import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get tasks for worker (calendar view)
router.get('/worker/calendar', authenticate, async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ error: 'Access denied. Worker only.' });
    }

    const { month, year } = req.query;
    let dateFilter = {};
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        dueDate: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const tasks = await Task.find({
      assignedTo: req.user._id,
      ...dateFilter
    })
    .populate('assignedBy', 'firstName lastName')
    .populate('comments.addedBy', 'firstName lastName')
    .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task details
router.get('/:taskId', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .populate('comments.addedBy', 'firstName lastName');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to this task
    if (req.user.userType === 'worker' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark task as completed
router.put('/:taskId/complete', authenticate, async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ error: 'Access denied. Worker only.' });
    }

    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedBy', 'firstName lastName')
      .populate('comments.addedBy', 'firstName lastName');

    res.json({ message: 'Task marked as completed', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to task
router.post('/:taskId/comments', [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to this task
    if (req.user.userType === 'worker' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comment = {
      text: req.body.text,
      addedBy: req.user._id,
      addedAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedBy', 'firstName lastName')
      .populate('comments.addedBy', 'firstName lastName');

    res.json({ message: 'Comment added successfully', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task (for admin/manager)
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('assignedTo').notEmpty().withMessage('Assigned worker is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], authenticate, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, description, assignedTo, dueDate, priority } = req.body;

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      shopId: req.user.shopId,
      dueDate: new Date(dueDate),
      priority: priority || 'medium'
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email');

    // Send real-time notification to worker
    const io = req.app.get('io');
    const { notifyTaskAssigned } = await import('../services/notificationService.js');
    await notifyTaskAssigned(assignedTo, populatedTask, io);

    res.status(201).json({ message: 'Task created successfully', task: populatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;