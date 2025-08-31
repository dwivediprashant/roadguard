import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authAPI } from '@/lib/api';
import { 
  ArrowLeft, Star, MapPin, Phone, Mail, Clock, 
  Wrench, Award, Calendar, MessageCircle
} from 'lucide-react';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  specialties: string[];
  experience: number;
  rating: number;
  completedJobs: number;
  availability: string;
  location: string;
  bio: string;
  certifications: string[];
}

const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerProfile();
  }, [workerId]);

  const fetchWorkerProfile = async () => {
    try {
      const response = await authAPI.getWorkerProfile(workerId!);
      setWorker(response.data);
    } catch (error) {
      console.error('Failed to fetch worker profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = () => {
    navigate(`/service-request/workshop1?workerId=${workerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading worker profile...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Worker not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleRequestService}
          >
            Request Service
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={worker.profileImage} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {worker.firstName[0]}{worker.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {worker.firstName} {worker.lastName}
                </h1>
                <p className="text-gray-300 mb-4">{worker.bio}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{worker.rating}</span>
                    <span className="text-gray-400">rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-400" />
                    <span className="text-white">{worker.completedJobs}</span>
                    <span className="text-gray-400">jobs completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-white">{worker.experience}</span>
                    <span className="text-gray-400">years experience</span>
                  </div>
                </div>

                <Badge 
                  variant={worker.availability === 'Available' ? 'default' : 'secondary'}
                  className={worker.availability === 'Available' ? 'bg-green-600' : 'bg-gray-600'}
                >
                  {worker.availability}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specialties */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {worker.specialties.map((specialty, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3 text-center">
                      <span className="text-gray-300">{specialty}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {worker.certifications.map((cert, index) => (
                    <Badge key={index} className="bg-blue-600 text-white">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{worker.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{worker.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{worker.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleRequestService}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;