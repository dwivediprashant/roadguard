import express from 'express';
import Workshop from '../models/Workshop.js';
const router = express.Router();

// Get workshops with search, filter, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      status = '',
      distance = '',
      userLat = '',
      userLng = '',
      page = 1,
      limit = 10,
      view = 'list'
    } = req.query;

    let query = {};
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Distance filter (if user location provided)
    if (distance && userLat && userLng) {
      const distanceInMeters = parseFloat(distance) * 1000; // Convert km to meters
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(userLng), parseFloat(userLat)]
          },
          $maxDistance: distanceInMeters
        }
      };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const workshops = await Workshop.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Workshop.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    // Calculate distance for each workshop
    const workshopsWithDistance = workshops.map(workshop => {
      let calculatedDistance = Math.random() * 10 + 1; // Random distance 1-11 km for demo
      
      return {
        ...workshop.toObject(),
        distance: Math.round(calculatedDistance * 10) / 10
      };
    });

    console.log(`Returning ${workshopsWithDistance.length} workshops`);
    res.json({
      workshops: workshopsWithDistance,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single workshop by ID
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.json(workshop);
  } catch (error) {
    console.error('Error fetching workshop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;