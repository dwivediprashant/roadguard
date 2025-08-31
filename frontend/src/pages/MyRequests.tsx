import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Request {
  id: string;
  workshopName: string;
  serviceName: string;
  serviceType?: string;
  status: string;
  urgency: string;
  location: string;
  preferredDate?: string;
  preferredTime?: string;
  issueDescription?: string;
  date: string;
  createdAt: string;
  adminName?: string;
  assignedWorker?: string;
}

const MyRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/requests/user/${user.id}`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'admin-reviewing': return 'bg-blue-500';
      case 'worker-assigned': return 'bg-purple-500';
      case 'in-progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'done': return 'bg-green-600';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    setDeleting(requestId);
    try {
      console.log('Deleting request:', requestId);
      const response = await fetch(`http://localhost:3001/api/requests/${requestId}`, {
        method: 'DELETE'
      });
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({ title: "Success", description: "Request deleted successfully" });
      } else {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
        toast({ title: "Error", description: `Failed to delete request: ${response.status}`, variant: "destructive" });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Error", description: "Network error during deletion", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading your requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white">My Requests</h1>
        </div>

        {requests.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <p className="text-white/70 text-lg">No requests found</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Submit a Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl">
                        {request.serviceName}
                      </CardTitle>
                      <p className="text-white/70 mt-1">{request.workshopName}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge className={`${getStatusColor(request.status)} text-white`}>
                        {request.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={`${getUrgencyColor(request.urgency)} border-current`}>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {request.urgency.toUpperCase()}
                      </Badge>
                      {request.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRequest(request.id)}
                          disabled={deleting === request.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-white/70">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{request.location}</span>
                      </div>
                      <div className="flex items-center text-white/70">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Submitted: {request.date}</span>
                      </div>
                      {request.preferredDate && (
                        <div className="text-white/70">
                          <span className="font-medium">Preferred Date:</span> {request.preferredDate}
                        </div>
                      )}
                      {request.preferredTime && (
                        <div className="text-white/70">
                          <span className="font-medium">Preferred Time:</span> {request.preferredTime}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {request.serviceType && (
                        <div className="text-white/70">
                          <span className="font-medium">Service Type:</span> {request.serviceType}
                        </div>
                      )}
                      {request.assignedWorker && (
                        <div className="text-white/70">
                          <span className="font-medium">Assigned Worker:</span> {request.assignedWorker}
                        </div>
                      )}
                      {request.adminName && (
                        <div className="text-white/70">
                          <span className="font-medium">Admin:</span> {request.adminName}
                        </div>
                      )}
                    </div>
                  </div>
                  {request.issueDescription && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-white/70 text-sm">
                        <span className="font-medium">Description:</span> {request.issueDescription}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;