import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Task from './models/Task.js';
import Worker from './models/Worker.js';
import authRoutes from './routes/auth.js';
import workerRoutes from './routes/worker.js';
import seedRoutes from './routes/seed.js';
import workshopRoutes from './routes/workshops.js';
import requestRoutes from './routes/requests.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';
import testRoutes from './routes/test.js';
import { authenticate } from './middleware/auth.js';
import { authenticateUser } from './middleware/workerAuth.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 3001;

// Make io available globally
app.set('io', io);

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/test', testRoutes);

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



server.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    server.listen(PORT + 1, () => {
      console.log(`✅ Backend server running on port ${PORT + 1}`);
    });
  }
});