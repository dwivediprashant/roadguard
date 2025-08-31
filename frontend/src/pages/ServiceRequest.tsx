import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, Navigation, User, Upload, MessageCircle, 
  CreditCard, MapPin, Calendar, Clock
} from 'lucide-react';

const ServiceRequest = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.firstName + ' ' + user?.lastName || '',
    description: '',
    serviceType: '',
    date: '',
    time: '',
    location: '',
    issue: '',
    images: [] as File[]
  });

  const handleSubmit = async () => {
    if (!formData.description || !formData.serviceType) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Service request submitted successfully!" });
    navigate('/dashboard');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Wrench className="h-6 w-6 text-purple-500" />
              <h1 className="text-2xl font-bold">New Service</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Navigation className="h-4 w-4 mr-2" />
                Track Service
              </Button>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 space-y-6">
                {/* Name Field */}
                <div>
                  <Label className="text-white mb-2 block">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-white mb-2 block">Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white min-h-24"
                    placeholder="Describe the service you need..."
                  />
                </div>

                {/* Service Type */}
                <div>
                  <Label className="text-white mb-2 block">Service Type *</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="instant">Instant Service</SelectItem>
                      <SelectItem value="prebook">Pre-book slots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2 block flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-2 block flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-white mb-2 block flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter service location"
                  />
                  <div className="mt-3 h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                    <iframe
                      src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0,40.7,-74.0,40.7&layer=mapnik"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Describe Issue</Label>
                    <Textarea
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Agent
                  </Button>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                    onClick={handleSubmit}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hints Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Important Notes</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>User must be logged in for further screens</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>You can add extra steps between checkout flow if required</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Upload clear images of the issue for better service</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Service Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Type:</span>
                    <span className="text-white">{formData.serviceType || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{formData.date || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">{formData.time || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Images:</span>
                    <span className="text-white">{formData.images.length} uploaded</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>Contact our support team if you need assistance with your service request.</p>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequest;