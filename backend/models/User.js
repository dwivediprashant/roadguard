import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['user', 'worker', 'admin'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribeNewsletter: {
    type: Boolean,
    default: false
  },
  // Profile fields
  currentEmployer: {
    type: String,
    default: 'RoadGuard Services'
  },
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'de'],
    default: 'en'
  },
  profileImage: {
    type: String,
    default: null
  },
  workHistory: [{
    position: String,
    company: String,
    startDate: String,
    endDate: String,
    description: String,
    isCurrent: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);