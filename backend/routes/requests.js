import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Notification from '../models/Notification.js';

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

    const adminRequests = requests.map(request => ({
      id: request._id,
      userName: `${request.userId.firstName} ${request.userId.lastName}`,
      userEmail: request.userId.email,
      userPhone: request.userId.phone,
      serviceName: request.message,
      serviceType: request.serviceType,
      status: request.status,
      urgency: request.urgency,
      location: request.location,
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      issueDescription: request.issueDescription,
      assignedWorker: request.mechanicId ? `${request.mechanicId.firstName} ${request.mechanicId.lastName}` : null,
      assignedWorkerId: request.mechanicId?._id,
      createdAt: request.createdAt,
      date: request.createdAt.toLocaleDateString()
    }));

    res.json({ requests: adminRequests });
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

// Assign worker to request
router.patch('/:requestId/assign', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { workerId, status = 'worker-assigned' } = req.body;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { 
        mechanicId: workerId,
        status: status
      },
      { new: true }
    ).populate('userId', 'firstName lastName email phone')
     .populate('mechanicId', 'firstName lastName email phone');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Create notification for worker
    const notification = new Notification({
      userId: workerId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${request.message}`,
      requestId: request._id
    });
    await notification.save();

    // Emit real-time notification to worker
    const io = req.app.get('io');
    io.to(`user_${workerId}`).emit('new_notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      requestId: request._id,
      isRead: false,
      createdAt: notification.createdAt
    });

    res.json({ message: 'Worker assigned successfully', request });
  } catch (error) {
    console.error('Error assigning worker:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create service request (for UserDashboard)
router.post('/service-requests', async (req, res) => {
  try {
    console.log('Received service request:', req.body);
    
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

    // Validate required fields
    if (!userId || !adminId || !workshopId || !serviceName) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['userId', 'adminId', 'workshopId', 'serviceName'],
        received: { userId, adminId, workshopId, serviceName }
      });
    }

    const request = new Request({
      userId,
      adminId,
      mechanicId: preferredWorkerId || null,
      shopId: workshopId,
      message: serviceName,
      location: location || 'Not specified',
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

    console.log('Saving request:', request);
    await request.save();
    console.log('Request saved successfully');

    // Create notification for admin
    console.log('Creating notification for admin:', adminId);
    const notification = new Notification({
      userId: adminId,
      type: 'request_received',
      title: 'New Service Request',
      message: `New ${serviceType} request from ${userName || 'User'}`,
      requestId: request._id
    });
    await notification.save();
    console.log('Notification saved:', notification._id);

    // Emit real-time notification to admin
    const io = req.app.get('io');
    const notificationData = {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      requestId: request._id,
      isRead: false,
      createdAt: notification.createdAt
    };
    
    console.log('Emitting notification to room:', `user_${adminId}`);
    console.log('Notification data:', notificationData);
    
    io.to(`user_${adminId}`).emit('new_notification', notificationData);
    
    // Also emit to all connected sockets for debugging
    io.emit('debug_notification', {
      adminId,
      room: `user_${adminId}`,
      notification: notificationData
    });

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
    console.error('Error stack:', error.stack);
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
          assignedWorkerId: request.mechanicId?._id,
          location: request.location,
          urgency: request.urgency,
          createdAt: request.createdAt
        };
      })
    );

    res.json(serviceRequests);
  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a request
router.delete('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only allow deletion of pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be deleted' });
    }
    
    await Request.findByIdAndDelete(requestId);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assigned tasks for worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    console.log('=== FETCHING TASKS FOR WORKER ===');
    console.log('Worker ID:', workerId);
    
    const requests = await Request.find({ mechanicId: workerId })
      .populate('userId', 'firstName lastName email phone')
      .populate('adminId', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log('Found requests:', requests.length);
    console.log('Requests:', requests.map(r => ({ id: r._id, mechanicId: r.mechanicId, status: r.status })));

    const workerTasks = await Promise.all(
      requests.map(async (request) => {
        const shop = await Shop.findOne({ shopId: request.shopId });
        return {
          id: request._id,
          customer: request.userId ? `${request.userId.firstName} ${request.userId.lastName}` : 'Test Customer',
          service: request.message,
          status: request.status,
          date: request.preferredDate || request.createdAt.toLocaleDateString(),
          time: request.preferredTime || 'Not specified',
          location: request.location,
          description: request.issueDescription || request.message,
          workshopName: shop?.shopName || 'Unknown Workshop',
          priority: request.urgency || 'medium',
          createdAt: request.createdAt
        };
      })
    );

    console.log('Returning tasks:', workerTasks.length);
    res.json({ tasks: workerTasks });
  } catch (error) {
    console.error('Get worker tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all requests for a user (My Requests page)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const requests = await Request.find({ userId })
      .populate('adminId', 'firstName lastName shopName')
      .populate('mechanicId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const userRequests = await Promise.all(
      requests.map(async (request) => {
        const shop = await Shop.findOne({ shopId: request.shopId });
        return {
          id: request._id,
          workshopName: shop?.shopName || 'Unknown Workshop',
          serviceName: request.message,
          serviceType: request.serviceType,
          status: request.status,
          urgency: request.urgency,
          location: request.location,
          preferredDate: request.preferredDate,
          preferredTime: request.preferredTime,
          issueDescription: request.issueDescription,
          date: request.createdAt.toLocaleDateString(),
          createdAt: request.createdAt,
          adminName: request.adminId ? `${request.adminId.firstName} ${request.adminId.lastName}` : null,
          assignedWorker: request.mechanicId ? `${request.mechanicId.firstName} ${request.mechanicId.lastName}` : null
        };
      })
    );

    res.json({ requests: userRequests });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;