import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, User, X, ChevronDown, Store } from "lucide-react";
import ShopWorkers from "@/components/ShopWorkers";

export default function AdminDashboard() {
  const [workshopOpen, setWorkshopOpen] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nearby');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const { user } = useAuth();
  
  const shopId = localStorage.getItem('shopId');
  const shopName = user?.shopName || localStorage.getItem('shopName');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Left Side - Workshop Status Toggle */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setWorkshopOpen(!workshopOpen)}
              className={`px-6 py-2 rounded-lg font-medium transition-smooth ${
                workshopOpen 
                  ? 'gradient-emergency text-primary-foreground emergency-glow' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mr-2 ${workshopOpen ? 'bg-green-200' : 'bg-gray-200'}`} />
              {workshopOpen ? 'Open For Request' : 'Closed'}
            </Button>
            
            {/* Workshop Status Explanation */}
            <div className="hidden lg:block ml-4 p-3 glass-effect border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Open for requests:</strong> If they are ready to receive the request<br/>
                <strong>Closed:</strong> If they don't want to accept the request for now.
              </p>
            </div>
          </div>

          {/* Right Side - Notification & User */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className="relative gradient-trust text-primary-foreground px-4 py-2 rounded-lg trust-glow"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notification
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white">
                3
              </span>
            </Button>

            <Button variant="outline" className="glass-effect border-primary/20 px-4 py-2 rounded-lg">
              <User className="h-4 w-4 mr-2" />
              User
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-6">
            {/* Show Open Only Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOpen"
                checked={showOpenOnly}
                onCheckedChange={setShowOpenOnly}
              />
              <Label htmlFor="showOpen" className="text-sm font-medium">Show open only</Label>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 glass-effect border-primary/20 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Distance Dropdown */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Distance:</Label>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-32 glass-effect border-primary/20 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="2km">2 km</SelectItem>
                  <SelectItem value="5km">5 km</SelectItem>
                  <SelectItem value="10km">10 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By Radio Buttons */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Sort by:</Label>
              <RadioGroup value={sortBy} onValueChange={setSortBy} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nearby" id="nearby" />
                  <Label htmlFor="nearby" className="text-sm">Nearby</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rated" id="rated" />
                  <Label htmlFor="rated" className="text-sm">Most Rated</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Main Dashboard Card */}
        <Card className="glass-effect border-primary/20 rounded-xl emergency-glow">
          <CardContent className="p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold gradient-emergency bg-clip-text text-transparent mb-4">Admin Dashboard</h2>
              
              {/* Shop Information */}
              {shopId && (
                <div className="glass-effect border-primary/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">Shop Information</h3>
                  </div>
                  <p className="text-lg font-medium">{shopName}</p>
                  <p className="text-sm text-muted-foreground">Shop ID: {shopId}</p>
                </div>
              )}
              
              <div className="bg-muted/50 border-2 border-dashed border-primary/30 rounded-lg p-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Dashboard to display the statistics of completed service & employee performance
                </p>
              </div>
              
              {/* Statistics Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="glass-effect border-primary/20 rounded-lg p-4 emergency-glow">
                  <h3 className="font-semibold text-primary">Completed Services</h3>
                  <p className="text-2xl font-bold text-foreground">24</p>
                </div>
                <div className="glass-effect border-primary/20 rounded-lg p-4 trust-glow">
                  <h3 className="font-semibold text-secondary">Shop Workers</h3>
                  <p className="text-2xl font-bold text-foreground">-</p>
                </div>
                <div className="glass-effect border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-accent">Pending Requests</h3>
                  <p className="text-2xl font-bold text-foreground">5</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Shop Workers */}
        {shopId && <ShopWorkers shopId={shopId} />}

        {/* Notification Panel (Screen 2) */}
        {showNotificationPanel && (
          <div className="absolute top-8 right-6 w-80 glass-effect border-primary/20 rounded-xl emergency-glow z-50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <Button
                  onClick={() => setShowNotificationPanel(false)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="glass-effect border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-foreground">
                    <strong>New service request generated in your location Downtown.</strong>
                    <br />
                    <span className="text-primary underline cursor-pointer">Click here to view more</span>
                  </p>
                </div>
                
                <div className="glass-effect border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-foreground">
                    Service completed at Mall Area by Worker #123
                  </p>
                </div>
                
                <div className="glass-effect border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-foreground">
                    Payment received for Highway 101 service
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Annotation Arrows (Visual Indicators) */}
        <div className="absolute top-4 right-96 hidden xl:block">
          <div className="glass-effect border-accent/30 rounded-lg p-2 text-xs text-accent">
            ← Screen 2: Notification Panel
          </div>
        </div>
      </div>

      {/* Workshop Status Explanation for Mobile */}
      <div className="lg:hidden mx-6 mb-6">
        <Card className="glass-effect border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              <strong>Open for requests:</strong> Ready to receive requests<br/>
              <strong>Closed:</strong> Not accepting requests currently
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}