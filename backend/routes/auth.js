import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
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

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType,
      subscribeNewsletter: subscribeNewsletter || false
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Universal Login - Auto-detects user type
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

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

    const token = generateToken(user._id);

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
      }
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

// Update user profile
router.put('/profile', authenticate, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('currentEmployer').optional().trim(),
  body('language').optional().isIn(['en', 'es', 'fr', 'de']).withMessage('Invalid language'),
  body('profileImage').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    }

    const { firstName, lastName, currentEmployer, language, profileImage, workHistory } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (currentEmployer !== undefined) updateData.currentEmployer = currentEmployer;
    if (language) updateData.language = language;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (workHistory) updateData.workHistory = workHistory;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        userType: updatedUser.userType,
        currentEmployer: updatedUser.currentEmployer,
        language: updatedUser.language,
        profileImage: updatedUser.profileImage,
        workHistory: updatedUser.workHistory
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (Admin only)
router.get('/users', authenticate, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.json({
      users: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        currentEmployer: user.currentEmployer,
        language: user.language,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (Admin only)
router.put('/users/:userId/role', authenticate, [
  body('userType').isIn(['user', 'worker', 'admin']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { userId } = req.params;
    const { userType } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userType },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        userType: updatedUser.userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Worker-specific login
router.post('/worker-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email, userType: 'worker' });
    if (!user) {
      return res.status(401).json({ error: 'Worker account not found with this email' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Worker account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Worker login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User-specific login
router.post('/user-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email, userType: 'user' });
    if (!user) {
      return res.status(401).json({ error: 'User account not found with this email' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'User account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'User login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email } = req.body;
    console.log('Looking for user with email:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP:', otp);

    // Update user with OTP
    await User.findByIdAndUpdate(user._id, {
      resetPasswordOTP: otp,
      resetPasswordExpiry: otpExpiry
    });

    console.log(`OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP sent to your email address' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', [
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
    
    if (!user || !user.resetPasswordOTP || !user.resetPasswordExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.resetPasswordOTP || !user.resetPasswordExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;