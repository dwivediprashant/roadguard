import mongoose from 'mongoose';
import Workshop from './models/Workshop.js';
import dotenv from 'dotenv';
dotenv.config();

const sampleWorkshops = [
  {
    name: "AutoCare Plus",
    description: "Full-service automotive repair and maintenance center specializing in engine diagnostics and brake services.",
    status: "open",
    location: {
      address: "123 Main Street",
      city: "Downtown",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    rating: 4.8,
    reviewCount: 156,
    services: ["Engine Repair", "Brake Service", "Oil Change", "Tire Replacement"],
    thumbnail: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop",
    contact: {
      phone: "+1-555-0123",
      email: "info@autocareplus.com"
    },
    workingHours: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "18:00" },
      saturday: { open: "09:00", close: "17:00" },
      sunday: { open: "10:00", close: "16:00" }
    }
  },
  {
    name: "Quick Fix Garage",
    description: "Fast and reliable automotive services with 24/7 emergency support.",
    status: "open",
    location: {
      address: "456 Oak Avenue",
      city: "Midtown",
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    rating: 4.2,
    reviewCount: 89,
    services: ["Emergency Repair", "Towing", "Battery Service", "Lockout Service"],
    thumbnail: "https://images.unsplash.com/photo-1632823471565-1ecdf7c8f9e4?w=300&h=200&fit=crop",
    contact: {
      phone: "+1-555-0456",
      email: "service@quickfixgarage.com"
    },
    workingHours: {
      monday: { open: "00:00", close: "23:59" },
      tuesday: { open: "00:00", close: "23:59" },
      wednesday: { open: "00:00", close: "23:59" },
      thursday: { open: "00:00", close: "23:59" },
      friday: { open: "00:00", close: "23:59" },
      saturday: { open: "00:00", close: "23:59" },
      sunday: { open: "00:00", close: "23:59" }
    }
  },
  {
    name: "Elite Motors Workshop",
    description: "Premium automotive service center for luxury and sports cars.",
    status: "closed",
    location: {
      address: "789 Park Lane",
      city: "Uptown",
      coordinates: { lat: 40.7831, lng: -73.9712 }
    },
    rating: 4.9,
    reviewCount: 234,
    services: ["Luxury Car Service", "Performance Tuning", "Detailing", "Restoration"],
    thumbnail: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&h=200&fit=crop",
    contact: {
      phone: "+1-555-0789",
      email: "contact@elitemotors.com"
    },
    workingHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: { open: "10:00", close: "15:00" },
      sunday: { open: "closed", close: "closed" }
    }
  },
  {
    name: "Budget Auto Repair",
    description: "Affordable automotive services without compromising on quality.",
    status: "open",
    location: {
      address: "321 Industrial Blvd",
      city: "Southside",
      coordinates: { lat: 40.6892, lng: -74.0445 }
    },
    rating: 4.0,
    reviewCount: 67,
    services: ["Basic Maintenance", "Inspection", "Minor Repairs", "Parts Replacement"],
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    contact: {
      phone: "+1-555-0321",
      email: "info@budgetautorepair.com"
    },
    workingHours: {
      monday: { open: "07:00", close: "19:00" },
      tuesday: { open: "07:00", close: "19:00" },
      wednesday: { open: "07:00", close: "19:00" },
      thursday: { open: "07:00", close: "19:00" },
      friday: { open: "07:00", close: "19:00" },
      saturday: { open: "08:00", close: "18:00" },
      sunday: { open: "closed", close: "closed" }
    }
  },
  {
    name: "Speedy Service Center",
    description: "Fast turnaround times for all your automotive needs.",
    status: "open",
    location: {
      address: "654 Highway 95",
      city: "Eastside",
      coordinates: { lat: 40.7282, lng: -73.7949 }
    },
    rating: 4.3,
    reviewCount: 112,
    services: ["Quick Lube", "Tire Service", "Brake Check", "AC Service"],
    thumbnail: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&h=200&fit=crop",
    contact: {
      phone: "+1-555-0654",
      email: "service@speedyservice.com"
    },
    workingHours: {
      monday: { open: "06:00", close: "20:00" },
      tuesday: { open: "06:00", close: "20:00" },
      wednesday: { open: "06:00", close: "20:00" },
      thursday: { open: "06:00", close: "20:00" },
      friday: { open: "06:00", close: "20:00" },
      saturday: { open: "07:00", close: "19:00" },
      sunday: { open: "08:00", close: "18:00" }
    }
  },
  {
    name: "Metro Auto Works",
    description: "Comprehensive automotive services in the heart of the city.",
    status: "open",
    location: {
      address: "987 Central Avenue",
      city: "Central District",
      coordinates: { lat: 40.7505, lng: -73.9934 }
    },
    rating: 4.6,
    reviewCount: 198,
    services: ["General Repair", "Transmission Service", "Electrical Work", "Diagnostics"],
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop",
    contact: {
      phone: "+1-555-0987",
      email: "info@metroautoworks.com"
    },
    workingHours: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "18:00" },
      saturday: { open: "09:00", close: "16:00" },
      sunday: { open: "closed", close: "closed" }
    }
  }
];

async function seedWorkshops() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing workshops
    await Workshop.deleteMany({});
    console.log('Cleared existing workshops');

    // Insert sample workshops
    const workshops = await Workshop.insertMany(sampleWorkshops);
    console.log(`Inserted ${workshops.length} workshops`);

    console.log('Workshop seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding workshops:', error);
    process.exit(1);
  }
}

seedWorkshops();