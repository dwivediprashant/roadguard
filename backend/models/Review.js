import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workshopId: {
    type: String,
    required: true
  },
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ workshopId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;