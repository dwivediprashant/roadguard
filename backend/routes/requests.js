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

// Create service request (for UserDashboard)
router.post('/service-requests', async (req, res) => {
  try {
    const {
      userId,
      workshopId,
      adminId,
      userName,
      serviceName,
      serviceType,
      preferredDate,
      preferredTime,
      location,
      issueDescription,
      preferredWorkerId,
      chatWithAgent,
      status = 'pending'
    } = req.body;

    const request = new Request({
      userId,
      adminId,
      mechanicId: preferredWorkerId,
      shopId: workshopId,
      message: serviceName,
      location,
      urgency: 'medium',
      status,
      // Additional fields for service requests
      userName,
      serviceType,
      preferredDate,
      preferredTime,
      issueDescription,
      chatWithAgent
    });

    await request.save();

    // Populate the response with workshop name
    const shop = await Shop.findOne({ shopId: workshopId });
    const responseData = {
      id: request._id,
      workshopName: shop?.shopName || 'Unknown Workshop',
      serviceName,
      status,
      date: new Date().toLocaleDateString(),
      adminId,
      assignedWorkerId: preferredWorkerId
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Service request creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get service requests for a user
router.get('/service-requests/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const requests = await Request.find({ userId })
      .populate('adminId', 'firstName lastName')
      .populate('mechanicId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const serviceRequests = await Promise.all(
      requests.map(async (request) => {
        const shop = await Shop.findOne({ shopId: request.shopId });
        return {
          id: request._id,
          workshopName: shop?.shopName || 'Unknown Workshop',
          serviceName: request.message,
          status: request.status,
          date: request.createdAt.toLocaleDateString(),
          adminId: request.adminId?._id,
          assignedWorker: request.mechanicId ? `${request.mechanicId.firstName} ${request.mechanicId.lastName}` : null,
          assignedWorkerId: request.mechanicId?._id
        };
      })
    );

    res.json(serviceRequests);
  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;