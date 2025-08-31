import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import SimpleMap from "@/components/SimpleMap";

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyAzjs-zFMmK8AFRXJsoBwef8ZL3UMRnChI';
import { 
  Car, MapPin, ArrowLeft, User, Building2, Phone, Send, Clock, Wrench, Users, AlertCircle,
  Search, Filter, Grid, List, Map, Star, Calendar, Upload, CreditCard, Eye, MessageCircle,
  Navigation, CheckCircle, Loader, Home, History, Settings, Bell
} from "lucide-react";

interface Workshop {
  shopId: string;
  shopName: string;
  admin: { firstName: string; lastName: string; };
  phone: string;
  mechanics: any[];
  rating: number;
  distance: number;
  isOpen: boolean;
  services: string[];
  description: string;
  location: { lat: number; lng: number; };
  reviews: any[];
}

interface ServiceRequest {
  id: string;
  workshopName: string;
  serviceName: string;
  status: 'pending' | 'admin-reviewing' | 'worker-assigned' | 'in-progress' | 'completed' | 'done';
  date: string;
  adminId?: string;
  assignedWorker?: string;
  assignedWorkerId?: string;
  location?: { lat: number; lng: number; };
  quotation?: {
    serviceCharges: number;
    variableCosts: number;
    sparePartsCosts: number;
    total: number;
    approved?: boolean;
  };
  adminNotes?: string;
  workerAssignedAt?: string;
}

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'booking' | 'tracking' | 'history'>('home');
  const [breadcrumbs, setBreadcrumbs] = useState(['Dashboard']);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card' | 'map'>('card');
  const [filters, setFilters] = useState({
    openOnly: false,
    distance: [10],
    minRating: 0,
    sortBy: 'nearest' as 'nearest' | 'rating'
  });
  
  // Data state
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [selectedMechanic, setSelectedMechanic] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [bookingForm, setBookingForm] = useState({
    userName: '',
    serviceName: '',
    description: '',
    serviceType: '',
    preferredDate: '',
    location: '',
    images: [] as File[],
    issue: '',
    chatWithAgent: false
  });
  
  // Location state
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 });

  useEffect(() => {
    getUserLocation();
    fetchWorkshops();
    if (user?.id) {
      fetchServiceRequests();
    }
  }, [user?.id]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied')
      );
    }
  };

  const fetchWorkshops = async () => {
    try {
      console.log('Fetching workshops...');
      const response = await fetch('http://localhost:3001/api/requests/shops');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw workshop data:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data);
        setWorkshops([]);
        return;
      }
      
      const enhancedData = data.map((shop: any) => ({
        ...shop,
        rating: 4.2,
        distance: Math.random() * 15 + 1,
        isOpen: true,
        services: ['Engine Repair', 'Oil Change', 'Brake Service', 'Tire Replacement'],
        description: 'Professional automotive service with experienced mechanics',
        location: { lat: userLocation.lat + (Math.random() - 0.5) * 0.1, lng: userLocation.lng + (Math.random() - 0.5) * 0.1 },
        reviews: []
      }));
      
      console.log('Enhanced workshop data:', enhancedData);
      setWorkshops(enhancedData);
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    if (!user?.id) {
      setServiceRequests([]);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/service-requests/user/${user.id}`);
      if (response.ok) {
        const requests = await response.json();
        setServiceRequests(requests);
      } else {
        setServiceRequests([]);
      }
    } catch (error) {
      setServiceRequests([]);
    }
  };

  const handleSubmitToAdmin = async () => {
    if (!bookingForm.description || !bookingForm.serviceType) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    console.log('Selected workshop:', selectedWorkshop);
    console.log('Admin data:', selectedWorkshop?.admin);
    console.log('Admin ID being sent:', selectedWorkshop?.admin?._id || selectedWorkshop?.admin?.id || selectedWorkshop?.adminId);

    const adminId = selectedWorkshop?.admin?._id || selectedWorkshop?.admin?.id || selectedWorkshop?.adminId;
    console.log('Extracted admin ID:', adminId);
    console.log('Full admin object:', selectedWorkshop?.admin);
    console.log('Full workshop object:', selectedWorkshop);
    console.log('Available admin fields:', Object.keys(selectedWorkshop?.admin || {}));
    
    const requestData = {
      userId: user?.id,
      workshopId: selectedWorkshop?.shopId,
      adminId: adminId,
      userName: bookingForm.userName || `${user?.firstName} ${user?.lastName}`,
      serviceName: bookingForm.description,
      serviceType: bookingForm.serviceType,
      preferredDate: bookingForm.preferredDate,
      location: bookingForm.location,
      issueDescription: bookingForm.issue,
      preferredWorkerId: selectedMechanic,
      chatWithAgent: bookingForm.chatWithAgent,
      status: 'pending'
    };
    
    if (!adminId) {
      toast({ title: "Error", description: "Admin ID not found for this workshop", variant: "destructive" });
      return;
    }
    
    console.log('Submitting request with data:', requestData);
    
    try {
      const response = await fetch('http://localhost:3001/api/requests/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const savedRequest = await response.json();
        console.log('Request submitted successfully:', savedRequest);
        toast({ 
          title: "Success", 
          description: "Request sent to admin successfully! Redirecting to My Requests..."
        });
        
        resetBookingForm();
        
        // Redirect to My Requests page
        setTimeout(() => {
          navigate('/my-requests');
        }, 1500);
      } else {
        const errorData = await response.text();
        console.error('Request submission failed:', response.status, errorData);
        toast({ title: "Error", description: `Failed to submit request: ${response.status}`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" });
    }
  };

  const resetBookingForm = () => {
    setBookingForm({
      userName: '', serviceName: '', description: '', serviceType: '', 
      preferredDate: '', location: '', images: [], issue: '', chatWithAgent: false
    });
  };

  const filteredWorkshops = workshops.filter(workshop => {
    if (searchQuery && !workshop.shopName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.openOnly && !workshop.isOpen) return false;
    if (workshop.distance > filters.distance[0]) return false;
    if (workshop.rating < filters.minRating) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'nearest') return a.distance - b.distance;
    return b.rating - a.rating;
  });

  const renderHeader = () => (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RoadGuard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/my-requests')}
            >
              My Requests
            </Button>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{user?.firstName} {user?.lastName}</span>
            </div>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
        
        <div className="mt-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="#" onClick={() => {
                        setCurrentView('home');
                        setBreadcrumbs(['Dashboard']);
                      }}>{crumb}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  );

  const renderNavigation = () => (
    <div className="border-b bg-muted/50">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-8 py-4">
          {[
            { key: 'home', label: 'Home', icon: Home },
            { key: 'search', label: 'Find Workshops', icon: Search },
            { key: 'history', label: 'Service History', icon: History }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={currentView === key ? 'default' : 'ghost'}
              onClick={() => {
                setCurrentView(key as any);
                setBreadcrumbs(['Dashboard', label]);
              }}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );

  const renderSearchFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={viewMode === 'card' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('card')}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'map' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('map')}>
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Switch checked={filters.openOnly} onCheckedChange={(checked) => setFilters({...filters, openOnly: checked})} />
            <Label>Open only</Label>
          </div>
          
          <div className="space-y-2">
            <Label>Distance: {filters.distance[0]} km</Label>
            <Slider
              value={filters.distance}
              onValueChange={(value) => setFilters({...filters, distance: value})}
              max={50}
              min={1}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Min Rating: {filters.minRating}</Label>
            <Slider
              value={[filters.minRating]}
              onValueChange={(value) => setFilters({...filters, minRating: value[0]})}
              max={5}
              min={0}
              step={0.5}
            />
          </div>
          
          <Select value={filters.sortBy} onValueChange={(value: 'nearest' | 'rating') => setFilters({...filters, sortBy: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nearest">Nearest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkshopCard = (workshop: Workshop) => (
    <Card key={workshop.shopId} className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{workshop.shopName}</span>
          </div>
          <Badge variant={workshop.isOpen ? 'default' : 'secondary'}>
            {workshop.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{workshop.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{workshop.distance.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{workshop.mechanics.length} workers</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{workshop.description}</p>
        
        {workshop.mechanics.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Workers:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {workshop.mechanics.slice(0, 3).map((mechanic, index) => (
                <div key={mechanic._id || index} className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{mechanic.firstName} {mechanic.lastName}</p>
                      <p className="text-xs text-muted-foreground">Registered Worker</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedWorkshop(workshop);
                      setSelectedMechanic(mechanic._id);
                      setCurrentView('booking');
                      setBreadcrumbs(['Dashboard', 'Book Service', `${mechanic.firstName} ${mechanic.lastName}`]);
                    }}
                  >
                    Request
                  </Button>
                </div>
              ))}
              {workshop.mechanics.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{workshop.mechanics.length - 3} more workers available
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No registered workers available</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {workshop.services.slice(0, 3).map((service, index) => (
            <Badge key={index} variant="outline" className="text-xs">{service}</Badge>
          ))}
          {workshop.services.length > 3 && (
            <Badge variant="outline" className="text-xs">+{workshop.services.length - 3} more</Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => navigate(`/workshop/${workshop.shopId}`)}
          >
            View Details
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setSelectedWorkshop(workshop);
              setCurrentView('booking');
              setBreadcrumbs(['Dashboard', 'Send Request', workshop.shopName]);
            }}
          >
            <Send className="h-4 w-4 mr-1" />
            Send Request to Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBookingForm = () => {
    const selectedWorker = selectedWorkshop?.mechanics.find(m => m._id === selectedMechanic);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Service Request - {selectedWorkshop?.shopName}</CardTitle>
            {selectedWorker && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium">Preferred Worker: {selectedWorker.firstName} {selectedWorker.lastName}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input
                value={bookingForm.userName}
                onChange={(e) => setBookingForm({...bookingForm, userName: e.target.value})}
                placeholder={`${user?.firstName} ${user?.lastName}`}
              />
            </div>
            
            <div>
              <Label>Service Description *</Label>
              <Textarea
                value={bookingForm.description}
                onChange={(e) => setBookingForm({...bookingForm, description: e.target.value})}
                placeholder="Describe the service you need..."
                required
              />
            </div>
            
            <div>
              <Label>Service Type *</Label>
              <Select value={bookingForm.serviceType} onValueChange={(value) => setBookingForm({...bookingForm, serviceType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant Service</SelectItem>
                  <SelectItem value="prebook">Pre-book Slot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Preferred Date</Label>
              <Input
                type="date"
                value={bookingForm.preferredDate}
                onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Your Location</Label>
              <Input
                value={bookingForm.location}
                onChange={(e) => setBookingForm({...bookingForm, location: e.target.value})}
                placeholder="Enter your location"
              />
            </div>
            
            <div>
              <Label>Upload Images (Optional)</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setBookingForm({...bookingForm, images: Array.from(e.target.files || [])})}
              />
            </div>
            
            <div>
              <Label>Issue Description</Label>
              <Textarea
                value={bookingForm.issue}
                onChange={(e) => setBookingForm({...bookingForm, issue: e.target.value})}
                placeholder="Describe the problem in detail..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={bookingForm.chatWithAgent}
                onChange={(e) => setBookingForm({...bookingForm, chatWithAgent: e.target.checked})}
              />
              <Label>Chat with agent/owner before service</Label>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📋 Your request will be sent directly to the admin for review and worker assignment.
              </p>
            </div>
            
            <Button onClick={handleSubmitToAdmin} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Request to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderServiceTracking = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serviceRequests.filter(req => req.status !== 'done').map((request) => (
          <Card key={request.id} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{request.serviceName}</span>
                <Badge variant={
                  request.status === 'pending' ? 'secondary' :
                  request.status === 'admin-reviewing' ? 'outline' :
                  request.status === 'worker-assigned' ? 'default' :
                  request.status === 'in-progress' ? 'default' :
                  request.status === 'completed' ? 'outline' : 'default'
                }>
                  {request.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {request.status === 'pending' ? '10%' : 
                     request.status === 'admin-reviewing' ? '25%' :
                     request.status === 'worker-assigned' ? '50%' :
                     request.status === 'in-progress' ? '75%' : '100%'}
                  </span>
                </div>
                <Progress value={
                  request.status === 'pending' ? 10 : 
                  request.status === 'admin-reviewing' ? 25 :
                  request.status === 'worker-assigned' ? 50 :
                  request.status === 'in-progress' ? 75 : 100
                } />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Workshop:</span>
                  <span>{request.workshopName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{request.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">
                    {request.status === 'pending' ? 'Awaiting Admin Assignment' : 
                     request.assignedWorker ? `Assigned to ${request.assignedWorker}` : 'Processing'}
                  </span>
                </div>
                {request.assignedWorker && (
                  <div className="flex justify-between">
                    <span>Assigned Worker:</span>
                    <span>{request.assignedWorker}</span>
                  </div>
                )}
              </div>
              
              {request.quotation && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quotation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Service Charges:</span>
                      <span>${request.quotation.serviceCharges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variable Costs:</span>
                      <span>${request.quotation.variableCosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spare Parts:</span>
                      <span>${request.quotation.sparePartsCosts}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total:</span>
                      <span>${request.quotation.total}</span>
                    </div>
                    <Button size="sm" className="w-full mt-2">
                      <CreditCard className="h-4 w-4 mr-1" />
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  Track Location
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderServiceHistory = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Service History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{request.serviceName}</div>
                  <div className="text-sm text-muted-foreground">{request.workshopName}</div>
                  <div className="text-sm text-muted-foreground">{request.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === 'done' ? 'default' : 'secondary'}>
                    {request.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return (
          <div className="space-y-6">
            {renderSearchFilters()}
            
            {/* Debug Info */}
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-sm">
                  <strong>Debug:</strong> Loading: {loading.toString()}, 
                  Total Workshops: {workshops.length}, 
                  Filtered: {filteredWorkshops.length}
                </p>
                {workshops.length > 0 && (
                  <p className="text-xs mt-1">
                    First workshop: {workshops[0]?.shopName || 'No name'}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {viewMode === 'map' ? (
              <Card>
                <CardContent className="p-6">
                  <div className="h-96 rounded overflow-hidden relative">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng-0.05},${userLocation.lat-0.05},${userLocation.lng+0.05},${userLocation.lat+0.05}&layer=mapnik`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Your Location:</span>
                        <span className="font-mono">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredWorkshops.length} workshops with {filteredWorkshops.reduce((total, w) => total + w.mechanics.length, 0)} available workers within {filters.distance[0]} km
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Nearby Workers & Workshops:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {filteredWorkshops.map((workshop) => (
                          <div key={workshop.shopId} className="p-3 border rounded-lg bg-background/50">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">{workshop.shopName}</h5>
                              <Badge variant={workshop.isOpen ? 'default' : 'secondary'} className="text-xs">
                                {workshop.distance.toFixed(1)} km
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {workshop.mechanics.slice(0, 2).map((mechanic, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    {mechanic.firstName} {mechanic.lastName}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      setSelectedWorkshop(workshop);
                                      setSelectedMechanic(mechanic._id);
                                      setCurrentView('booking');
                                      setBreadcrumbs(['Dashboard', 'Book Service', `${mechanic.firstName} ${mechanic.lastName}`]);
                                    }}
                                  >
                                    Request
                                  </Button>
                                </div>
                              ))}
                              {workshop.mechanics.length > 2 && (
                                <p className="text-xs text-muted-foreground">
                                  +{workshop.mechanics.length - 2} more workers
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {loading ? (
                  Array.from({length: 6}).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredWorkshops.map(renderWorkshopCard)
                )}
              </div>
            )}
          </div>
        );
      case 'booking':
        return renderBookingForm();
      case 'history':
        return renderServiceHistory();
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setCurrentView('search');
                setBreadcrumbs(['Dashboard', 'Find Workshops']);
              }}>
                <CardContent className="p-6 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Find Workshops</h3>
                  <p className="text-sm text-muted-foreground">Search and filter nearby workshops</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setCurrentView('history');
                setBreadcrumbs(['Dashboard', 'Service History']);
              }}>
                <CardContent className="p-6 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Service History</h3>
                  <p className="text-sm text-muted-foreground">View past service records</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Your Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded overflow-hidden">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng-0.01},${userLocation.lat-0.01},${userLocation.lng+0.01},${userLocation.lat+0.01}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current Location:</span>
                    <span className="font-mono">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 w-full"
                    onClick={getUserLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Update Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {renderHeader()}
      {renderNavigation()}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;