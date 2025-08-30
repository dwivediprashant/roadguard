import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import SimpleMap from "@/components/SimpleMap";
import { 
  Building2, Star, MapPin, Phone, Clock, User, Wrench, 
  Calendar, MessageCircle, Navigation, ArrowLeft, CheckCircle
} from "lucide-react";

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

interface WorkshopDetailsProps {
  workshop: Workshop;
  onBack: () => void;
  onBookService: () => void;
}

const WorkshopDetails = ({ workshop, onBack, onBookService }: WorkshopDetailsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const mockReviews = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      rating: 5,
      comment: "Excellent service! Fixed my car quickly and professionally.",
      date: "2024-01-10",
      service: "Engine Repair"
    },
    {
      id: 2,
      customerName: "Mike Chen",
      rating: 4,
      comment: "Good work, fair pricing. Will come back again.",
      date: "2024-01-08",
      service: "Oil Change"
    },
    {
      id: 3,
      customerName: "Emily Davis",
      rating: 5,
      comment: "Very knowledgeable staff. Explained everything clearly.",
      date: "2024-01-05",
      service: "Brake Service"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-400/50 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{workshop.shopName}</h1>
          <p className="text-muted-foreground">Workshop Details</p>
        </div>
      </div>

      {/* Quick Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">{workshop.shopName}</span>
                <Badge variant={workshop.isOpen ? 'default' : 'secondary'}>
                  {workshop.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(workshop.rating)}
                  <span className="ml-2 font-medium">{workshop.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">({mockReviews.length} reviews)</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{workshop.distance.toFixed(1)} km away</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Open 8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{workshop.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Owner Information</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {workshop.admin.firstName[0]}{workshop.admin.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{workshop.admin.firstName} {workshop.admin.lastName}</p>
                  <p className="text-sm text-muted-foreground">{workshop.admin.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <Button onClick={onBookService} className="w-full">
                  <Wrench className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Workshop
                </Button>
                <Button variant="outline" className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Workshop</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{workshop.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Workshop Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Certified Mechanics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Modern Equipment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Quality Parts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Warranty Service
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Available Mechanics</h4>
                  <div className="space-y-2">
                    {workshop.mechanics.slice(0, 3).map((mechanic, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 border rounded">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {mechanic.firstName?.[0]}{mechanic.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{mechanic.firstName} {mechanic.lastName}</p>
                          <p className="text-xs text-muted-foreground">Certified Mechanic</p>
                        </div>
                      </div>
                    ))}
                    {workshop.mechanics.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{workshop.mechanics.length - 3} more mechanics
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workshop.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-primary" />
                      <span className="font-medium">{service}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Customer Reviews
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(workshop.rating)}
                  </div>
                  <span className="font-medium">{workshop.rating.toFixed(1)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = mockReviews.filter(r => Math.floor(r.rating) === rating).length;
                    const percentage = (count / mockReviews.length) * 100;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm w-8">{rating} ★</span>
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Individual Reviews */}
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.customerName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{review.customerName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{review.service}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 border rounded-lg overflow-hidden">
                  <SimpleMap />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Address</h4>
                    <p className="text-sm text-muted-foreground">
                      123 Main Street<br />
                      Downtown Area<br />
                      City, State 12345
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{workshop.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Mon-Sat: 8:00 AM - 6:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkshopDetails;