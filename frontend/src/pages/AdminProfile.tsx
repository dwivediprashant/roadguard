import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authAPI } from '@/lib/api';
import { 
  ArrowLeft, Star, MapPin, Phone, Mail, Building, 
  Users, Calendar, MessageCircle, Award
} from 'lucide-react';

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  shopName: string;
  shopId: string;
  location: string;
  bio: string;
  experience: number;
  rating: number;
  totalWorkers: number;
  completedServices: number;
  joinedDate: string;
}

const AdminProfile = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminProfile();
  }, [adminId]);

  const fetchAdminProfile = async () => {
    try {
      const response = await authAPI.getAdminProfile(adminId!);
      setAdmin(response.data);
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = () => {
    // Navigate to contact or messaging functionality
    console.log('Contact admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading admin profile...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Admin not found</div>
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
            onClick={handleContactAdmin}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Admin
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={admin.profileImage} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {admin.firstName[0]}{admin.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {admin.firstName} {admin.lastName}
                </h1>
                <p className="text-xl text-purple-400 mb-2">Workshop Owner</p>
                <p className="text-gray-300 mb-4">{admin.bio}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{admin.rating}</span>
                    <span className="text-gray-400">rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-400" />
                    <span className="text-white">{admin.completedServices}</span>
                    <span className="text-gray-400">services completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-white">{admin.totalWorkers}</span>
                    <span className="text-gray-400">workers</span>
                  </div>
                </div>

                <Badge className="bg-green-600 text-white">
                  {admin.experience} years experience
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workshop Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Workshop Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{admin.shopName}</h3>
                  <p className="text-gray-300">Shop ID: {admin.shopId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{admin.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">
                    Established: {new Date(admin.joinedDate).toLocaleDateString()}
                  </span>
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
                  <span className="text-gray-300">{admin.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{admin.email}</span>
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
                  onClick={() => navigate(`/workshop/${admin.shopId}`)}
                >
                  <Building className="h-4 w-4 mr-2" />
                  View Workshop
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300"
                  onClick={handleContactAdmin}
                >
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

export default AdminProfile;