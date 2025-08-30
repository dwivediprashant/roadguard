import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Shop from '../models/Shop.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// Generate Shop ID
const generateShopId = () => {
  return 'SH' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Admin Signup
router.post('/admin-signup', async (req, res) => {
  try {
    const { firstName, lastName, phone, shopName, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate unique shop ID
    let shopId;
    let shopExists;
    do {
      shopId = generateShopId();
      shopExists = await Shop.findOne({ shopId });
    } while (shopExists);

    // Create admin user
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

    // Create shop
    const shop = new Shop({
      shopId,
      shopName,
      adminId: user._id,
      phone
    });

    await shop.save();

    // Generate token
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

// Regular signup
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType: userType || 'user'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Worker Signup
router.post('/worker-signup', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, shopId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let shop = null;
    let validatedShopId = null;

    // Verify shop exists if shopId is provided
    if (shopId && shopId.trim()) {
      shop = await Shop.findOne({ shopId: shopId.toUpperCase() });
      if (!shop) {
        return res.status(400).json({ message: 'Invalid shop ID' });
      }
      validatedShopId = shopId.toUpperCase();
    }

    // Create worker user
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

    // Create worker profile
    const worker = new Worker({
      userId: user._id,
      ...(validatedShopId && { shopId: validatedShopId })
    });

    await worker.save();

    // Generate token
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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, shopId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Handle shop ID update for workers
    if (user.userType === 'worker' && shopId && shopId.trim()) {
      const shop = await Shop.findOne({ shopId: shopId.toUpperCase() });
      if (!shop) {
        return res.status(400).json({ message: 'Invalid shop ID' });
      }
      
      // Update user's shop ID
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

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        shopId: user.shopId,
        shopName: user.shopName
      },
      ...shopInfo
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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiry (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, user.firstName);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }

    res.json({
      message: 'Password reset OTP sent to your email address'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;