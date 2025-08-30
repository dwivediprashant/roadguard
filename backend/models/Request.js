import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  shopId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'admin-reviewing', 'worker-assigned', 'in-progress', 'completed', 'done', 'accepted', 'rejected'],
    default: 'pending'
  },
  location: {
    type: String,
    required: false
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Additional fields for service requests
  userName: {
    type: String,
    required: false
  },
  serviceType: {
    type: String,
    required: false
  },
  preferredDate: {
    type: String,
    required: false
  },
  preferredTime: {
    type: String,
    required: false
  },
  issueDescription: {
    type: String,
    required: false
  },
  chatWithAgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Request', requestSchema);