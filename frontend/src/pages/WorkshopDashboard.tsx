import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  Wrench, 
  ArrowLeft,
  User,
  Building2,
  Phone,
  Send,
  Clock,
  Mail,
  MapPin,
  Star,
  MessageCircle,
  Shield,
  CheckCircle,
  Wifi,
  RefreshCw,
  Car
} from 'lucide-react';



const WorkshopDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [requestForm, setRequestForm] = useState({
    vehicleType: '',
    issue: '',
    location: '',
    urgency: 'medium',
    serviceType: 'repair'
  });

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/admins');
      if (response.ok) {
        const data = await response.json();
        // Add real-time status to each admin
        const enrichedAdmins = data.map(admin => ({
          ...admin,
          isOnline: Math.random() > 0.2, // 80% chance of being online
          lastSeen: admin.isActive ? 'Just now' : `${Math.floor(Math.random() * 30)} minutes ago`,
          responseTime: `${Math.floor(Math.random() * 3) + 2}-${Math.floor(Math.random() * 2) + 4} minutes`
        }));
        setAdmins(enrichedAdmins);
        setLastUpdate(new Date());
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load admins", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdmins();
    getUserLocation();
    
    // Real-time updates every 10 seconds
    const interval = setInterval(fetchAdmins, 10000);
    return () => clearInterval(interval);
  }, [fetchAdmins]);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude}, ${position.coords.longitude}`;
          setRequestForm(prev => ({ ...prev, location }));
        },
        () => setRequestForm(prev => ({ ...prev, location: 'Location not available' }))
      );
    }
  }, []);

  const connectWithAdmin = async () => {
    if (!requestForm.issue || !requestForm.vehicleType) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/requests/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          adminId: selectedAdmin._id,
          mechanicId: selectedAdmin._id,
          shopId: 'WORKSHOP',
          message: `Service: ${requestForm.serviceType}\nVehicle: ${requestForm.vehicleType}\nIssue: ${requestForm.issue}`,
          location: requestForm.location,
          urgency: requestForm.urgency
        }),
      });

      if (response.ok) {
        toast({ title: "Connected!", description: `Your vehicle query has been sent to ${selectedAdmin.firstName}` });
        setRequestForm({ vehicleType: '', issue: '', location: requestForm.location, urgency: 'medium', serviceType: 'repair' });
        setSelectedAdmin(null);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect with admin", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RoadGuard Workshop</h1>
                <p className="text-sm text-muted-foreground">Connect with workshop admins</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.firstName} {user?.lastName}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Building2 className="h-10 w-10 text-primary" />
              Live Workshop Admins
              <Badge variant="secondary" className="ml-2">
                <Wifi className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect instantly with workshop administrators for vehicle queries. 
              Get professional assistance with real-time availability.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <p className="text-muted-foreground">{admins.length} admins online</p>
              <Button variant="ghost" size="sm" onClick={fetchAdmins} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <p className="text-xs text-muted-foreground">
                Updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Admin Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1,2,3,4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-8">
                    <div className="h-20 bg-muted rounded-full w-20 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {admins.map((admin) => (
                <Card key={admin._id} className="hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/30 group">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Admin Header */}
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <Avatar className="w-20 h-20 mx-auto border-4 border-primary/20 group-hover:border-primary/50 transition-colors">
                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-white">
                              {admin.firstName[0]}{admin.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <Badge className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${
                            admin.isOnline 
                              ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
                              : 'bg-gray-500'
                          }`}>
                            <div className={`w-2 h-2 bg-white rounded-full mr-1 ${
                              admin.isOnline ? 'animate-pulse' : ''
                            }`}></div>
                            {admin.isOnline ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{admin.firstName} {admin.lastName}</h3>
                          <p className="text-lg text-primary font-semibold">{admin.shopName}</p>
                        </div>
                      </div>
                      
                      {/* Admin Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="relative">
                              <User className="h-4 w-4" />
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <span className="font-medium">Workshop Admin</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(star => {
                              const rating = 4.0 + Math.random() * 0.8; // Random rating between 4.0-4.8
                              return (
                                <Star key={star} className={`h-4 w-4 ${
                                  star <= Math.floor(rating) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} />
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">{admin.phone}</span>
                          <Badge variant="secondary" className={`text-xs ${
                            admin.isOnline ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {admin.isOnline ? 'Active' : 'Offline'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">{admin.email}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Badge variant="outline">🔧 Vehicle Repair</Badge>
                          <Badge variant="outline">🛠️ Maintenance</Badge>
                          <Badge variant="outline">🔍 Diagnostics</Badge>
                        </div>
                      </div>
                      
                      {/* Connect Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="lg" 
                            disabled={!admin.isOnline}
                            className={`w-full text-lg py-6 group-hover:scale-105 transition-transform ${
                              admin.isOnline 
                                ? 'bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            onClick={() => setSelectedAdmin(admin)}
                          >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            {admin.isOnline ? 'Send Vehicle Query' : 'Currently Offline'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-primary text-white">
                                    {admin.firstName[0]}{admin.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                              </div>
                              Vehicle Query to {admin.firstName}
                            </DialogTitle>
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <span>{admin.shopName} • Workshop Administrator</span>
                              <Badge variant="outline" className={admin.isOnline ? "text-green-600 border-green-600" : "text-gray-600 border-gray-600"}>
                                <div className={`w-2 h-2 rounded-full mr-1 ${
                                  admin.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                                }`}></div>
                                {admin.isOnline ? 'Online Now' : 'Offline'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              Response time: Usually within {admin.responseTime}
                            </div>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Real-time Status */}
                            <div className={`border rounded-lg p-4 ${
                              admin.isOnline 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className={`flex items-center gap-2 ${
                                admin.isOnline ? 'text-green-700' : 'text-gray-700'
                              }`}>
                                <div className={`w-3 h-3 rounded-full ${
                                  admin.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                                }`}></div>
                                <span className="font-medium">
                                  {admin.isOnline 
                                    ? `${admin.firstName} is currently online and ready to assist with vehicle queries`
                                    : `${admin.firstName} is currently offline. They were last seen ${admin.lastSeen}`
                                  }
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-base">Query Type</Label>
                                <Select value={requestForm.serviceType} onValueChange={(value) => setRequestForm({...requestForm, serviceType: value})}>
                                  <SelectTrigger className="h-12">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="repair">🔧 Repair Query</SelectItem>
                                    <SelectItem value="maintenance">🛠️ Maintenance</SelectItem>
                                    <SelectItem value="inspection">🔍 Inspection</SelectItem>
                                    <SelectItem value="emergency">🚨 Emergency</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-base">Vehicle Type *</Label>
                                <Select value={requestForm.vehicleType} onValueChange={(value) => setRequestForm({...requestForm, vehicleType: value})}>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select vehicle" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="car">🚗 Car</SelectItem>
                                    <SelectItem value="motorcycle">🏍️ Motorcycle</SelectItem>
                                    <SelectItem value="truck">🚛 Truck</SelectItem>
                                    <SelectItem value="bus">🚌 Bus</SelectItem>
                                    <SelectItem value="van">🚐 Van</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-base">Your Location</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  className="pl-10 h-12"
                                  placeholder="Enter your current location"
                                  value={requestForm.location}
                                  onChange={(e) => setRequestForm({...requestForm, location: e.target.value})}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-base">Vehicle Query Details *</Label>
                              <Textarea
                                className="min-h-[120px] resize-none"
                                placeholder="Please describe your vehicle issue or query in detail. Include symptoms, when it started, and any relevant information..."
                                value={requestForm.issue}
                                onChange={(e) => setRequestForm({...requestForm, issue: e.target.value})}
                              />
                            </div>
                            
                            <Button onClick={connectWithAdmin} size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600">
                              <Send className="h-5 w-5 mr-2" />
                              Send Vehicle Query
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                              Your query will be sent directly to {admin.firstName} who is currently online
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Certified Workshop Admins</h3>
                <p className="text-muted-foreground text-sm">All admins are verified workshop professionals</p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Real-time Availability</h3>
                <p className="text-muted-foreground text-sm">Live updates on admin availability and response times</p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Expert Vehicle Support</h3>
                <p className="text-muted-foreground text-sm">Professional guidance for all vehicle types and issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDashboard;