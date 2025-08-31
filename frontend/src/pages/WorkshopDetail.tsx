import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Mail, Star, Send, ArrowLeft, 
  Facebook, Twitter, Linkedin, Instagram, Wrench, Car, Settings
} from 'lucide-react';

interface Workshop {
  shopId: string;
  shopName: string;
  admin: { firstName: string; lastName: string; email?: string; phone?: string; };
  phone: string;
  mechanics: any[];
  rating: number;
  distance: number;
  isOpen: boolean;
  services: string[];
  description: string;
  location: { lat: number; lng: number; };
}

const WorkshopDetail = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    fetchWorkshopDetail();
  }, [workshopId]);

  const fetchWorkshopDetail = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/requests/shops');
      if (response.ok) {
        const workshops = await response.json();
        const foundWorkshop = workshops.find((w: Workshop) => w.shopId === workshopId);
        if (foundWorkshop) {
          setWorkshop({
            ...foundWorkshop,
            rating: 4.2,
            distance: Math.random() * 15 + 1,
            isOpen: true,
            services: ['Engine Repair', 'Oil Change', 'Brake Service', 'Tire Replacement', 'Battery Check', 'AC Service'],
            description: 'Professional automotive service with experienced mechanics and state-of-the-art equipment.',
            location: { lat: 40.7128, lng: -74.0060 }
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch workshop details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    navigate(`/service-request/${workshopId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading workshop details...</div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Workshop not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Login
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Workshop Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{workshop.shopName}</h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              {workshop.description}
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            onClick={handleBookService}
          >
            Book Service
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Location Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Location</h2>
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-pink-500 mr-3" />
                  <span className="text-gray-300">Silver Auditorium, Ahmedabad, Gujarat</span>
                </div>
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${workshop.location.lng-0.01},${workshop.location.lat-0.01},${workshop.location.lng+0.01},${workshop.location.lat+0.01}&layer=mapnik&marker=${workshop.location.lat},${workshop.location.lng}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-white">Services we provide</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workshop.services.map((service, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition-colors">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        {index % 3 === 0 ? <Wrench className="h-6 w-6" /> : 
                         index % 3 === 1 ? <Car className="h-6 w-6" /> : 
                         <Settings className="h-6 w-6" />}
                      </div>
                      <p className="text-sm text-gray-300">{service}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Reviews */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-white">Customer Reviews</h2>
                
                {/* Review Input */}
                <div className="flex gap-3 mb-6">
                  <Input
                    placeholder="Write your review..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  {[
                    { name: 'John Doe', rating: 5, comment: 'Excellent service! Very professional and quick.', badge: 'Very good service' },
                    { name: 'Jane Smith', rating: 4, comment: 'Great experience, will definitely come back.', badge: 'Recommended' },
                    { name: 'Mike Johnson', rating: 5, comment: 'Outstanding work on my car. Highly recommended!', badge: 'Excellent' }
                  ].map((review, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-700 rounded-lg">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white">{review.name}</h4>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} 
                              />
                            ))}
                          </div>
                          <Badge className="bg-green-600 text-white text-xs">{review.badge}</Badge>
                        </div>
                        <p className="text-gray-300">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Owner Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {workshop.admin.firstName[0]}{workshop.admin.lastName[0]}
                      </span>
                    </div>
                    <span className="text-gray-300">{workshop.admin.firstName} {workshop.admin.lastName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-300">{workshop.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-300">{workshop.admin.email || 'contact@workshop.com'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Share</h3>
                <div className="flex gap-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 p-2">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 p-2">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800 p-2">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 p-2">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Workshop Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Workshop Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white">{workshop.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distance</span>
                    <span className="text-white">{workshop.distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge variant={workshop.isOpen ? 'default' : 'secondary'}>
                      {workshop.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Workers</span>
                    <span className="text-white">{workshop.mechanics.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;