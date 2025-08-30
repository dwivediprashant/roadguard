import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';

const router = express.Router();

// Get all shops with their admins and mechanics
router.get('/shops', async (req, res) => {
  try {
    const shops = await Shop.find({ isActive: true })
      .populate('adminId', 'firstName lastName email phone profileImage');
    
    const shopsWithMechanics = await Promise.all(
      shops.map(async (shop) => {
        const mechanics = await User.find({ 
          userType: 'worker', 
          shopId: shop.shopId 
        }).select('firstName lastName email phone profileImage');
        
        return {
          shopId: shop.shopId,
          shopName: shop.shopName,
          phone: shop.phone,
          admin: shop.adminId,
          mechanics
        };
      })
    );

    res.json(shopsWithMechanics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send request to admin for specific mechanic
router.post('/send', async (req, res) => {
  try {
    const { userId, adminId, mechanicId, shopId, message, location, urgency } = req.body;

    const request = new Request({
      userId,
      adminId,
      mechanicId,
      shopId,
      message,
      location,
      urgency
    });

    await request.save();

    res.status(201).json({
      message: 'Request sent successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get requests for admin
router.get('/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const requests = await Request.find({ adminId })
      .populate('userId', 'firstName lastName email phone')
      .populate('mechanicId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update request status
router.patch('/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate('userId', 'firstName lastName email phone')
     .populate('mechanicId', 'firstName lastName email phone');

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;