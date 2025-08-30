import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, Clock, MapPin, Phone, Wrench, CheckCircle, 
  Eye, UserCheck, Calendar, DollarSign
} from "lucide-react";

interface ServiceRequest {
  _id: string;
  userId: string;
  userName: string;
  serviceName: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  issueDescription: string;
  quotation: {
    serviceCharges: number;
    variableCosts: number;
    sparePartsCosts: number;
    total: number;
  };
  status: string;
  preferredWorkerId?: string;
  assignedWorkerId?: string;
  createdAt: string;
  workshopId: string;
}

interface Worker {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const AdminServiceRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchServiceRequests();
      fetchWorkers();
    }
  }, [user?.id]);

  const fetchServiceRequests = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/requests/admin/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || data);
      }
    } catch (error) {
      console.error('Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/workers');
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch (error) {
      console.error('Failed to fetch workers');
    }
  };

  const assignWorker = async (requestId: string, workerId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'worker-assigned', workerId })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Worker assigned successfully!" });
        fetchServiceRequests();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign worker", variant: "destructive" });
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Status updated successfully!" });
        fetchServiceRequests();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'secondary',
      'admin-reviewing': 'outline',
      'worker-assigned': 'default',
      'in-progress': 'default',
      'completed': 'outline'
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const renderRequestCard = (request: ServiceRequest) => (
    <Card key={request._id} className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>{request.userName}</span>
          </div>
          <Badge variant={getStatusBadge(request.status) as any}>
            {request.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Service:</strong> {request.serviceName}</p>
            <p><strong>Type:</strong> {request.serviceType}</p>
          </div>
          <div>
            <p><strong>Date:</strong> {request.preferredDate}</p>
            <p><strong>Time:</strong> {request.preferredTime}</p>
          </div>
        </div>

        <div className="text-sm">
          <p><strong>Location:</strong> {request.location}</p>
          <p><strong>Issue:</strong> {request.issueDescription}</p>
        </div>

        {request.quotation && (
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p><strong>Total Amount:</strong> ${request.quotation.total}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Service Request Details</DialogTitle>
              </DialogHeader>
              {selectedRequest && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <p><strong>Name:</strong> {selectedRequest.userName}</p>
                      <p><strong>Service:</strong> {selectedRequest.serviceName}</p>
                      <p><strong>Type:</strong> {selectedRequest.serviceType}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Schedule</h4>
                      <p><strong>Date:</strong> {selectedRequest.preferredDate}</p>
                      <p><strong>Time:</strong> {selectedRequest.preferredTime}</p>
                      <p><strong>Location:</strong> {selectedRequest.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Issue Description</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedRequest.issueDescription}</p>
                  </div>

                  {selectedRequest.quotation && (
                    <div>
                      <h4 className="font-medium mb-2">Quotation</h4>
                      <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Service Charges:</span>
                          <span>${selectedRequest.quotation.serviceCharges}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Variable Costs:</span>
                          <span>${selectedRequest.quotation.variableCosts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Spare Parts:</span>
                          <span>${selectedRequest.quotation.sparePartsCosts}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Total:</span>
                          <span>${selectedRequest.quotation.total}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {request.status === 'pending' && (
            <Select onValueChange={(workerId) => assignWorker(request._id, workerId)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assign Worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((worker) => (
                  <SelectItem key={worker._id} value={worker._id}>
                    {worker.firstName} {worker.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {request.status !== 'completed' && (
            <Select onValueChange={(status) => updateRequestStatus(request._id, status)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin-reviewing">Reviewing</SelectItem>
                <SelectItem value="worker-assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Requests</h2>
        <Badge variant="outline">{requests.length} Total Requests</Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(renderRequestCard)}
        </div>
      )}

      {!loading && requests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Service Requests</h3>
            <p className="text-sm text-muted-foreground">No service requests have been submitted yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminServiceRequests;