import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js';
import authRoutes from './routes/auth.js';
import { authenticate } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RoadGuard API is running' });
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