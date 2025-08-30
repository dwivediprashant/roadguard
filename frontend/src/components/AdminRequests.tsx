import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, User, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests/admin/${user.id}`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Request ${status} successfully`
        });
        fetchRequests();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      accepted: 'secondary',
      rejected: 'destructive',
      completed: 'outline'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[urgency] || 'text-gray-600';
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Service Requests</h2>
      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {request.userId.firstName} {request.userId.lastName}
                  </CardTitle>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Requested Mechanic: {request.mechanicId.firstName} {request.mechanicId.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{request.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-4 w-4 ${getUrgencyColor(request.urgency)}`} />
                      <span className={`text-sm ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.toUpperCase()} Priority
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{new Date(request.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Message:</p>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateRequestStatus(request._id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateRequestStatus(request._id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {request.status === 'accepted' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateRequestStatus(request._id, 'completed')}
                  >
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRequests;