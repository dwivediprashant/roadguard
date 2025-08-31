import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, Phone, Mail, Star, Calendar, Wrench } from 'lucide-react';

interface WorkerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  createdAt: string;
  workHistory?: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    isCurrent: boolean;
  }>;
}

const WorkerProfile = () => {
  const { workerId } = useParams();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerProfile();
  }, [workerId]);

  const fetchWorkerProfile = async () => {
    if (!workerId) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/auth/worker-profile/${workerId}`);

      if (response.ok) {
        const data = await response.json();
        setWorker(data.worker);
      } else {
        console.error('Failed to fetch worker profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching worker profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Worker not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.close()}
            className="mb-4"
          >
            ← Close
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Worker Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage src={worker.profileImage} alt="Profile" />
                <AvatarFallback className="text-2xl bg-blue-100">
                  {worker.firstName[0]}{worker.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-xl font-bold">{worker.firstName} {worker.lastName}</h2>
                <Badge className="bg-blue-100 text-blue-800 mt-2">
                  <Wrench className="h-3 w-3 mr-1" />
                  Worker
                </Badge>
              </div>

              {worker.bio && (
                <p className="text-gray-600 text-sm">{worker.bio}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {worker.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  {worker.phone}
                </div>
                {worker.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {worker.location}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(worker.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {worker.workHistory && worker.workHistory.length > 0 ? (
                  <div className="space-y-4">
                    {worker.workHistory.map((work, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 pb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{work.position}</h3>
                          {work.isCurrent && (
                            <Badge className="bg-green-100 text-green-800">Current</Badge>
                          )}
                        </div>
                        <p className="text-blue-600 font-medium">{work.company}</p>
                        <p className="text-sm text-gray-600">
                          {work.startDate} - {work.isCurrent ? 'Present' : work.endDate}
                        </p>
                        {work.description && (
                          <p className="text-gray-700 mt-2">{work.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No work experience added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Rating */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Skills & Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.8 (24 reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Engine Repair', 'Brake Service', 'Oil Change', 'Tire Replacement'].map((skill) => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;