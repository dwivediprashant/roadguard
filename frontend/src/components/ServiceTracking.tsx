import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleMap from "@/components/SimpleMap";
import { 
  Clock, User, MapPin, MessageCircle, Phone, Navigation, 
  CheckCircle, Loader, AlertCircle, Car, Wrench, CreditCard
} from "lucide-react";

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

interface ServiceTrackingProps {
  request: ServiceRequest;
}

const ServiceTracking = ({ request }: ServiceTrackingProps) => {
  const [activeTab, setActiveTab] = useState('status');
  const [newMessage, setNewMessage] = useState('');
  const [liveLocation, setLiveLocation] = useState({ lat: 40.7128, lng: -74.0060 });

  // Simulate live location updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (request.assignedWorker?.location) {
        setLiveLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [request.assignedWorker]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressPercentage = () => {
    switch (request.status) {
      case 'pending': return 10;
      case 'admin-reviewing': return 25;
      case 'worker-assigned': return 50;
      case 'in-progress': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Mock sending message
    const message = {
      id: Date.now().toString(),
      sender: 'user' as const,
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    request.communicationLog.push(message);
    setNewMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">{request.serviceName}</h2>
                <p className="text-sm text-muted-foreground">{request.workshopName}</p>
              </div>
            </div>
            <Badge variant={
              request.status === 'pending' ? 'secondary' :
              request.status === 'in-progress' ? 'default' :
              request.status === 'completed' ? 'outline' : 'default'
            }>
              {getStatusIcon(request.status)}
              <span className="ml-1">{request.status.replace('-', ' ').toUpperCase()}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Service Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Request ID:</span>
                <p className="font-medium">#{request.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{request.date}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Completion:</span>
                <p className="font-medium">2-3 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Worker Info */}
      {request.assignedWorker && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assigned Worker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.assignedWorker.photo} />
                  <AvatarFallback>
                    {request.assignedWorker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.assignedWorker.name}</p>
                  <p className="text-sm text-muted-foreground">Certified Mechanic</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{request.assignedWorker.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Tracking Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status Updates</TabsTrigger>
          <TabsTrigger value="location" disabled={!request.assignedWorker}>Live Location</TabsTrigger>
          <TabsTrigger value="quotation">Quotation</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{item.status}</h4>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Worker Location
                <Badge variant="outline" className="ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 border rounded-lg overflow-hidden">
                  <SimpleMap />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="text-sm">Worker is en route to your location</span>
                  </div>
                  <span className="text-sm font-medium">ETA: 15 mins</span>
                </div>
                
                <Button className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions to Workshop
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotation" className="space-y-4">
          {request.quotation ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Service Quotation
                  <Badge variant={request.quotation.approved ? 'default' : 'secondary'}>
                    {request.quotation.approved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Service Charges:</span>
                    <span className="font-medium">${request.quotation.serviceCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variable Costs:</span>
                    <span className="font-medium">${request.quotation.variableCosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spare Parts:</span>
                    <span className="font-medium">${request.quotation.sparePartsCosts}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>${request.quotation.total}</span>
                    </div>
                  </div>
                </div>
                
                {!request.quotation.approved && (
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Quotation
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Request Changes
                    </Button>
                  </div>
                )}
                
                {request.quotation.approved && (
                  <Button className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Quotation Pending</h3>
                <p className="text-sm text-muted-foreground">
                  The workshop is preparing your service quotation. You'll be notified once it's ready.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {request.communicationLog.map((log) => (
                  <div key={log.id} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      log.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceTracking;