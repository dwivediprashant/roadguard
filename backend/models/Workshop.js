import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  services: [{
    type: String
  }],
  images: [{
    type: String
  }],
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Workshop'
  },
  contact: {
    phone: String,
    email: String
  },
  workingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  owner: {
    name: {
      type: String,
      default: 'Harry'
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
workshopSchema.index({ "location.coordinates": "2dsphere" });

// Index for text search
workshopSchema.index({ name: "text", description: "text", services: "text" });

export default mongoose.model('Workshop', workshopSchema);