import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: {
    type: String,
    enum: ['available', 'in_service', 'not_available'],
    default: 'available'
  },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date, default: Date.now }
  },
  skills: [{
    type: String,
    enum: ['Battery Jump', 'Tire Change', 'Fuel Delivery', 'Towing', 'Lockout Service', 'Engine Repair']
  }],
  rating: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  notifications: [{
    message: String,
    type: { type: String, enum: ['task_assigned', 'task_updated', 'system'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Worker', workerSchema);