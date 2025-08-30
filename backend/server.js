import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js';
import Task from './models/Task.js';
import Worker from './models/Worker.js';
import authRoutes from './routes/auth.js';
import workerRoutes from './routes/worker.js';
import seedRoutes from './routes/seed.js';
import workshopRoutes from './routes/workshops.js';
import { authenticate } from './middleware/auth.js';
import { authenticateUser } from './middleware/workerAuth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Disable request logging
app.use((req, res, next) => {
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/workshops', workshopRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RoadGuard API is running' });
});

// Auto-create sample users on first request
app.get('/api/init', async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default;
    
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

    // Create sample worker if not exists
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

    res.json({
      message: 'Sample accounts created',
      credentials: {
        user: { email: 'user@roadguard.com', password: 'password123' },
        worker: { email: 'worker@roadguard.com', password: 'password123' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/requests', authenticate, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/requests', authenticate, async (req, res) => {
  try {
    const request = new Request({ ...req.body, userId: req.user._id });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/requests/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});