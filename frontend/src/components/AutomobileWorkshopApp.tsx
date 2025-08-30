import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginWithOTP from "./LoginWithOTP";
import UserDashboard from "../pages/UserDashboard";
import WorkshopDetails from "./WorkshopDetails";
import ServiceTracking from "./ServiceTracking";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface Workshop {
  shopId: string;
  shopName: string;
  admin: { firstName: string; lastName: string; email: string; };
  phone: string;
  mechanics: any[];
  rating: number;
  distance: number;
  isOpen: boolean;
  services: string[];
  description: string;
  location: { lat: number; lng: number; };
  reviews: any[];
  openHours: string;
  address: string;
}

interface ServiceRequest {
  id: string;
  workshopName: string;
  serviceName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'done';
  date: string;
  assignedWorker?: {
    name: string;
    phone: string;
    photo?: string;
    location?: { lat: number; lng: number; };
  };
  timeline: {
    timestamp: string;
    status: string;
    description: string;
    completed: boolean;
  }[];
  quotation?: {
    serviceCharges: number;
    variableCosts: number;
    sparePartsCosts: number;
    total: number;
    approved: boolean;
  };
  communicationLog: {
    id: string;
    sender: 'user' | 'workshop' | 'agent';
    message: string;
    timestamp: string;
  }[];
}

const AutomobileWorkshopApp = () => {
  const { user: authUser, login } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(authUser);
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'workshop-details' | 'service-tracking'>('login');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
      setCurrentView('dashboard');
    }
  }, [authUser]);

  const handleLoginSuccess = (userData: User) => {
    setCurrentUser(userData);
    login(userData);
    setCurrentView('dashboard');
  };

  const handleViewWorkshopDetails = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setCurrentView('workshop-details');
  };

  const handleTrackService = (request: ServiceRequest) => {
    setSelectedServiceRequest(request);
    setCurrentView('service-tracking');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedWorkshop(null);
    setSelectedServiceRequest(null);
  };

  // Mock service request for demonstration
  const mockServiceRequest: ServiceRequest = {
    id: '12345',
    workshopName: 'AutoFix Pro',
    serviceName: 'Engine Diagnostic & Repair',
    status: 'in-progress',
    date: '2024-01-15',
    assignedWorker: {
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      photo: '',
      location: { lat: 40.7128, lng: -74.0060 }
    },
    timeline: [
      {
        timestamp: '2024-01-15 09:00',
        status: 'Request Submitted',
        description: 'Your service request has been submitted successfully.',
        completed: true
      },
      {
        timestamp: '2024-01-15 09:15',
        status: 'Admin Review',
        description: 'Workshop admin is reviewing your request and selecting the best mechanic.',
        completed: true
      },
      {
        timestamp: '2024-01-15 09:30',
        status: 'Worker Assigned',
        description: 'Admin has assigned John Smith as your dedicated mechanic.',
        completed: true
      },
      {
        timestamp: '2024-01-15 10:00',
        status: 'Service Started',
        description: 'Your assigned mechanic has started working on your vehicle.',
        completed: true
      },
      {
        timestamp: '2024-01-15 11:00',
        status: 'Parts Assessment',
        description: 'Mechanic is assessing required parts and preparing quotation.',
        completed: false
      },
      {
        timestamp: 'Pending',
        status: 'Service Completion',
        description: 'Final service work and quality check.',
        completed: false
      }
    ],
    quotation: {
      serviceCharges: 150,
      variableCosts: 75,
      sparePartsCosts: 225,
      total: 450,
      approved: true
    },
    communicationLog: [
      {
        id: '1',
        sender: 'workshop',
        message: 'Hello! We have received your service request. Our admin is reviewing it and will assign the best available mechanic shortly.',
        timestamp: '2024-01-15T09:00:00Z'
      },
      {
        id: '2',
        sender: 'workshop',
        message: 'Great news! Admin has assigned John Smith as your dedicated mechanic. He will contact you soon.',
        timestamp: '2024-01-15T09:30:00Z'
      },
      {
        id: '3',
        sender: 'agent',
        message: 'Hi! This is John Smith, your assigned mechanic. I will start working on your vehicle shortly.',
        timestamp: '2024-01-15T09:45:00Z'
      },
      {
        id: '4',
        sender: 'user',
        message: 'Thank you! When can I expect the service to be completed?',
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        id: '5',
        sender: 'agent',
        message: 'Based on initial assessment, I estimate completion by 3 PM today. Will keep you updated on progress.',
        timestamp: '2024-01-15T10:15:00Z'
      }
    ]
  };

  if (!currentUser && currentView === 'login') {
    return <LoginWithOTP onLoginSuccess={handleLoginSuccess} />;
  }

  switch (currentView) {
    case 'workshop-details':
      return selectedWorkshop ? (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <WorkshopDetails
              workshop={selectedWorkshop}
              onBack={handleBackToDashboard}
              onBookService={() => {
                // Handle booking service - could navigate to booking form
                handleBackToDashboard();
              }}
            />
          </div>
        </div>
      ) : null;

    case 'service-tracking':
      return selectedServiceRequest ? (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <ServiceTracking request={selectedServiceRequest} />
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <ServiceTracking request={mockServiceRequest} />
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );

    case 'dashboard':
    default:
      return <UserDashboard />;
  }
};

export default AutomobileWorkshopApp;