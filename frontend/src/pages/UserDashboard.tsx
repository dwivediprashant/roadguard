import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SimpleMap from "@/components/SimpleMap";
import { 
  Car, 
  MapPin, 
  ArrowLeft,
  User,
  Building2,
  Phone,
  Send,
  Clock,
  Wrench,
  Users,
  AlertCircle
} from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [requestForm, setRequestForm] = useState({
    vehicleType: '',
    issue: '',
    location: '',
    urgency: 'medium'
  });

  useEffect(() => {
    getUserLocation();
    fetchShops();
    const interval = setInterval(fetchShops, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude}, ${position.coords.longitude}`;
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setRequestForm(prev => ({ ...prev, location }));
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  };

  const fetchShops = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/requests/shops');
      const data = await response.json();
      setShops(data);
    } catch (error) {
      console.error('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async () => {
    if (!selectedMechanic || !requestForm.issue || !requestForm.vehicleType) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/requests/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          adminId: selectedShop.admin._id,
          mechanicId: selectedMechanic,
          shopId: selectedShop.shopId,
          message: `Vehicle: ${requestForm.vehicleType}\nIssue: ${requestForm.issue}`,
          location: requestForm.location,
          urgency: requestForm.urgency
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Request sent successfully!" });
        setRequestForm({ vehicleType: '', issue: '', location: requestForm.location, urgency: 'medium' });
        setSelectedMechanic('');
        setSelectedShop(null);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
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
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RoadGuard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName}</p>
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Real-time Shops Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                Available Shops
                <Badge variant="secondary" className="ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </h2>
              <p className="text-muted-foreground">{shops.length} shops online</p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => (
                  <Card key={shop.shopId} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <span className="truncate">{shop.shopName}</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Online
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Admin: {shop.admin.firstName} {shop.admin.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{shop.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{shop.mechanics.length} mechanics available</span>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                            onClick={() => setSelectedShop(shop)}
                          >
                            <Wrench className="h-4 w-4 mr-2" />
                            Request Vehicle Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Car className="h-5 w-5" />
                              Vehicle Service Request - {shop.shopName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Vehicle Type</Label>
                                <Select value={requestForm.vehicleType} onValueChange={(value) => setRequestForm({...requestForm, vehicleType: value})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vehicle" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="car">Car</SelectItem>
                                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                    <SelectItem value="truck">Truck</SelectItem>
                                    <SelectItem value="bus">Bus</SelectItem>
                                    <SelectItem value="van">Van</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Urgency</Label>
                                <Select value={requestForm.urgency} onValueChange={(value) => setRequestForm({...requestForm, urgency: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Select Mechanic</Label>
                              <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a mechanic" />
                                </SelectTrigger>
                                <SelectContent>
                                  {shop.mechanics.map((mechanic) => (
                                    <SelectItem key={mechanic._id} value={mechanic._id}>
                                      {mechanic.firstName} {mechanic.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Your Location</Label>
                              <Input
                                placeholder="Enter your current location"
                                value={requestForm.location}
                                onChange={(e) => setRequestForm({...requestForm, location: e.target.value})}
                              />
                            </div>
                            
                            <div>
                              <Label>Vehicle Issue Description</Label>
                              <Textarea
                                placeholder="Describe your vehicle problem in detail..."
                                value={requestForm.issue}
                                onChange={(e) => setRequestForm({...requestForm, issue: e.target.value})}
                                rows={3}
                              />
                            </div>
                            
                            <Button onClick={sendRequest} className="w-full">
                              <Send className="h-4 w-4 mr-2" />
                              Send Vehicle Service Request
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Live Location Map */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Your Live Location
                <Badge variant="outline" className="ml-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  GPS Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '400px' }}>
                <SimpleMap />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;