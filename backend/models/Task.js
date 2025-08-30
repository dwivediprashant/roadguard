import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  serviceType: { 
    type: String, 
    enum: ['Battery Jump', 'Tire Change', 'Fuel Delivery', 'Towing', 'Lockout Service', 'Engine Repair'],
    required: true 
  },
  category: {
    type: String,
    enum: ['Emergency', 'Maintenance', 'Repair', 'Delivery'],
    required: true
  },
  location: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  scheduledTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['assigned', 'start_service', 'reached', 'in_progress', 'completed', 'done'],
    default: 'assigned'
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quotation: {
    baseCost: { type: Number, required: true },
    additionalCosts: [{
      item: String,
      cost: Number
    }],
    totalCost: { type: Number, required: true }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  distance: { type: Number }, // in kilometers
  upvotes: { type: Number, default: 0 },
  notes: [{ 
    message: String,
    timestamp: { type: Date, default: Date.now },
    sender: { type: String, enum: ['worker', 'client'] }
  }],
  liveLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  },
  invoice: {
    generated: { type: Boolean, default: false },
    invoiceId: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);