import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import Worker from '../models/Worker.js';
import Shop from '../models/Shop.js';
import Review from '../models/Review.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { authenticate } from '../middleware/auth.js';

// Import logged-in workers map
import { loggedInWorkers } from './workers.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Generate Shop ID
const generateShopId = () => {
  return 'SH' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Register
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['user', 'worker', 'admin']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password, userType, subscribeNewsletter } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate verification OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType,
      subscribeNewsletter: subscribeNewsletter || false,
      verificationOTP,
      verificationExpiry
    });

    await user.save();

    // Log OTP for testing (remove in production)
    console.log(`Verification OTP for ${email}: ${verificationOTP}`);

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      requiresVerification: true,
      email: user.email,
      verificationOTP: verificationOTP // Remove in production
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Signup
router.post('/admin-signup', async (req, res) => {
  try {
    const { firstName, lastName, phone, shopName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let shopId;
    let shopExists;
    do {
      shopId = generateShopId();
      shopExists = await Shop.findOne({ shopId });
    } while (shopExists);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType: 'admin',
      shopName
    });

    await user.save();

    const shop = new Shop({
      shopId,
      shopName,
      adminId: user._id,
      phone
    });

    await shop.save();

    const token = jwt.sign(
      { userId: user._id, userType: 'admin', shopId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        shopName: user.shopName
      },
      shopId,
      shopName
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Worker Signup
router.post('/worker-signup', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, shopId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let shop = null;
    let validatedShopId = null;

    if (shopId && shopId.trim()) {
      shop = await Shop.findOne({ shopId: shopId.toUpperCase() });
      if (!shop) {
        return res.status(400).json({ message: 'Invalid shop ID' });
      }
      validatedShopId = shopId.toUpperCase();
    }

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType: 'worker',
      ...(validatedShopId && { shopId: validatedShopId })
    });

    await user.save();

    const worker = new Worker({
      userId: user._id,
      ...(validatedShopId && { shopId: validatedShopId })
    });

    await worker.save();

    const tokenPayload = { userId: user._id, userType: 'worker' };
    if (validatedShopId) {
      tokenPayload.shopId = validatedShopId;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Worker registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        shopId: user.shopId
      },
      ...(shop && { shopName: shop.shopName })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send OTP for login
router.post('/send-otp', [
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Find or create user with phone
    let user = await User.findOne({ phone });
    if (!user) {
      // Create temporary user for OTP verification
      user = new User({
        phone,
        firstName: 'User',
        lastName: '',
        email: `${phone}@temp.com`,
        password: 'temp123',
        userType: 'user',
        verificationOTP: otp,
        verificationExpiry: otpExpiry,
        isVerified: false
      });
      await user.save();
    } else {
      // Update existing user with new OTP
      user.verificationOTP = otp;
      user.verificationExpiry = otpExpiry;
      await user.save();
    }
    
    console.log(`OTP for ${phone}: ${otp}`);
    
    res.json({
      message: 'OTP sent successfully',
      otp: otp // Remove in production
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and login
router.post('/verify-otp', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
], async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.verificationOTP || user.verificationExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // Clear OTP and mark as verified
    user.verificationOTP = undefined;
    user.verificationExpiry = undefined;
    user.isVerified = true;
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Universal Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, shopId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in', requiresVerification: true, email: user.email });
    }

    // Handle shop ID update for workers
    if (user.userType === 'worker' && shopId && shopId.trim()) {
      const shop = await Shop.findOne({ shopId: shopId.toUpperCase() });
      if (!shop) {
        return res.status(400).json({ message: 'Invalid shop ID' });
      }
      
      user.shopId = shopId.toUpperCase();
      await user.save();
    }

    let tokenPayload = { userId: user._id, userType: user.userType };
    let shopInfo = {};

    if (user.userType === 'admin') {
      const shop = await Shop.findOne({ adminId: user._id });
      if (shop) {
        tokenPayload.shopId = shop.shopId;
        shopInfo = { shopId: shop.shopId, shopName: shop.shopName };
      }
    } else if (user.userType === 'worker' && user.shopId) {
      const shop = await Shop.findOne({ shopId: user.shopId });
      tokenPayload.shopId = user.shopId;
      shopInfo = { shopId: user.shopId, shopName: shop?.shopName };
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    // Track worker login
    if (user.userType === 'worker') {
      const userId = user._id.toString();
      loggedInWorkers.set(userId, {
        loginTime: Date.now(),
        lastActivity: Date.now()
      });
      console.log(`=== WORKER LOGIN TRACKED ===`);
      console.log(`Worker ID: ${userId}`);
      console.log(`Map size after login: ${loggedInWorkers.size}`);
      console.log(`Map contents:`, Array.from(loggedInWorkers.entries()));
      console.log(`=============================`);
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      },
      ...shopInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      userType: req.user.userType,
      currentEmployer: req.user.currentEmployer,
      language: req.user.language,
      profileImage: req.user.profileImage,
      workHistory: req.user.workHistory
    }
  });
});

// Verify Email with OTP
router.post('/verify-email', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (!user.verificationOTP || !user.verificationExpiry) {
      return res.status(400).json({ message: 'No verification OTP found. Please request a new one.' });
    }

    if (user.verificationExpiry < new Date()) {
      return res.status(400).json({ message: 'Verification OTP has expired' });
    }

    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update user as verified
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      verificationOTP: undefined,
      verificationExpiry: undefined
    });

    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resend Verification OTP
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      verificationOTP,
      verificationExpiry
    });

    // Log OTP for testing (remove in production)
    console.log(`New verification OTP for ${email}: ${verificationOTP}`);

    res.json({
      message: 'Verification OTP sent to your email',
      verificationOTP: verificationOTP // Remove in production
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot Password - Send Reset Link
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to database
    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt
    });

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Send email with MJML template
    console.log('=== PASSWORD RESET DEBUG ===');
    console.log(`Email: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`API Key exists: ${!!process.env.RESEND_API_KEY}`);
    console.log('============================');
    
    try {
      const result = await sendPasswordResetEmail(email, resetLink, user.firstName);
      console.log('Email send result:', result);
      console.log(`Password reset email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      console.error('Error details:', emailError.message);
      // Still return success to user for security (don't reveal if email exists)
      console.log('Continuing despite email error for security...');
    }

    res.json({ message: 'Password reset link sent to your email address' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reset Password with Token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { token, newPassword } = req.body;
    
    // Find valid token
    const resetToken = await PasswordResetToken.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    }).populate('userId');
    
    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update user password
    const user = resetToken.userId;
    user.password = newPassword;
    await user.save();

    // Delete the used token
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Shop Info
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const shop = await Shop.findOne({ shopId }).populate('adminId', 'firstName lastName email');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({
      shopId: shop.shopId,
      shopName: shop.shopName,
      phone: shop.phone,
      admin: shop.adminId,
      isActive: shop.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Workers by Shop
router.get('/shop/:shopId/workers', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const shop = await Shop.findOne({ shopId });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const workers = await User.find({ 
      userType: 'worker', 
      shopId: shopId 
    }).select('-password -resetPasswordOTP -resetPasswordExpiry');

    res.json({
      shopName: shop.shopName,
      workers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test email route
router.post('/test-resend', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Testing Resend with email:', email);
    console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
    
    const testLink = 'http://localhost:3000/reset-password?token=test123';
    
    const result = await sendPasswordResetEmail(email, testLink, 'Test User');
    console.log('Test email result:', result);
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit Review
router.post('/reviews', authenticate, [
  body('workshopId').notEmpty().withMessage('Workshop ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required')
], async (req, res) => {
  try {
    const { workshopId, rating, comment, serviceRequestId, images } = req.body;
    
    const review = new Review({
      userId: req.user._id,
      workshopId,
      rating,
      comment,
      serviceRequestId,
      images: images || []
    });
    
    await review.save();
    
    // Populate user data for response
    await review.populate('userId', 'firstName lastName');
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        id: review._id,
        userName: `${review.userId.firstName} ${review.userId.lastName}`,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt.toLocaleDateString(),
        badge: rating >= 5 ? 'Excellent' : rating >= 4 ? 'Very good service' : 'Good'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Reviews for Workshop
router.get('/reviews/:workshopId', async (req, res) => {
  try {
    const { workshopId } = req.params;
    
    const reviews = await Review.find({ workshopId })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const formattedReviews = reviews.map(review => ({
      id: review._id,
      userName: `${review.userId.firstName} ${review.userId.lastName}`,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toLocaleDateString(),
      badge: review.rating >= 5 ? 'Excellent' : 
             review.rating >= 4 ? 'Very good service' : 
             review.rating >= 3 ? 'Good' : 'Average'
    }));
    
    res.json({ reviews: formattedReviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Worker Profile
router.get('/worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    
    const worker = await User.findById(workerId)
      .select('-password -resetPasswordOTP -resetPasswordExpiry');
    
    if (!worker || worker.userType !== 'worker') {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    // Get worker's completed requests for stats
    const completedJobs = await Request.countDocuments({ 
      mechanicId: workerId, 
      status: 'completed' 
    });
    
    const workerProfile = {
      id: worker._id,
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email,
      phone: worker.phone,
      profileImage: worker.profileImage,
      specialties: worker.specialties || ['Engine Repair', 'Brake Service', 'Oil Change'],
      experience: worker.experience || 5,
      rating: worker.rating || 4.5,
      completedJobs,
      availability: worker.availability || 'Available',
      location: worker.location || 'Workshop Location',
      bio: worker.bio || 'Experienced automotive technician',
      certifications: worker.certifications || ['ASE Certified']
    };
    
    res.json(workerProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Admin Profile
router.get('/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const admin = await User.findById(adminId)
      .select('-password -resetPasswordOTP -resetPasswordExpiry');
    
    if (!admin || admin.userType !== 'admin') {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Get shop details
    const shop = await Shop.findOne({ adminId: admin._id });
    
    // Get completed services count
    const completedServices = await Request.countDocuments({ 
      adminId: admin._id, 
      status: 'completed' 
    });
    
    // Get total workers count
    const totalWorkers = await User.countDocuments({ 
      userType: 'worker', 
      shopId: shop?.shopId 
    });
    
    const adminProfile = {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      profileImage: admin.profileImage,
      shopName: shop?.shopName || admin.shopName || 'Workshop',
      shopId: shop?.shopId || 'N/A',
      location: admin.location || 'Workshop Location',
      bio: admin.bio || 'Experienced workshop owner committed to quality service',
      experience: admin.experience || 10,
      rating: admin.rating || 4.5,
      totalWorkers,
      completedServices,
      joinedDate: admin.createdAt
    };
    
    res.json(adminProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get worker profile (public)
router.get('/worker-profile/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    console.log('Fetching worker profile for ID:', workerId);
    
    const worker = await User.findById(workerId).select('-password');
    console.log('Found worker:', worker ? 'Yes' : 'No');
    
    if (!worker || worker.userType !== 'worker') {
      console.log('Worker not found or not a worker type');
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    res.json({ worker });
  } catch (error) {
    console.error('Error in worker profile route:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;