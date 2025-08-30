import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Car, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  AlertTriangle,
  Navigation,
  Wrench,
  Shield,
  User,
  ArrowLeft
} from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeRequests] = useState([
    {
      id: 1,
      type: "Flat Tire",
      location: "Highway 101, Mile 45",
      status: "In Progress",
      worker: "John Smith",
      eta: "15 mins",
      rating: 4.8
    }
  ]);

  const [recentServices] = useState([
    {
      id: 1,
      type: "Battery Jump",
      date: "2024-01-15",
      worker: "Mike Johnson",
      rating: 5,
      cost: "$45"
    },
    {
      id: 2,
      type: "Tire Change",
      date: "2024-01-10",
      worker: "Sarah Wilson",
      rating: 4.5,
      cost: "$60"
    }
  ]);

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
              <Badge variant="secondary" className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>User</span>
              </Badge>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Request Button */}
            <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                        Need Emergency Help?
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Get roadside assistance in minutes
                      </p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Request Help
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5" />
                  <span>Active Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeRequests.length > 0 ? (
                  <div className="space-y-4">
                    {activeRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{request.type}</h4>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {request.location}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{request.status}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{request.worker}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>ETA: {request.eta}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{request.rating}</span>
                          </div>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <MapPin className="w-3 h-3 mr-1" />
                              Track
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active requests</p>
                    <p className="text-sm">Request help when you need roadside assistance</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Recent Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{service.type}</h4>
                          <p className="text-sm text-muted-foreground">{service.date} • {service.worker}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm">{service.rating}</span>
                        </div>
                        <p className="text-sm font-medium">{service.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Car className="w-4 h-4 mr-2" />
                  Flat Tire
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="w-4 h-4 mr-2" />
                  Battery Jump
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Towing Service
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Lockout Service
                </Button>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{user?.firstName} {user?.lastName}</h4>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span>Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total requests</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;