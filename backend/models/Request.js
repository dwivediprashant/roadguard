import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: { type: String, required: true },
  service: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['pending', 'assigned', 'completed'], default: 'pending' },
  assignedWorker: { type: String },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Request', requestSchema);