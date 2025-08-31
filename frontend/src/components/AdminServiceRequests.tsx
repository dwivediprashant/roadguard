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
  id: string;
  _id?: string;
  userId: string;
  userName: string;
  serviceName: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  issueDescription: string;
  quotation?: {
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
  const [onlineWorkers, setOnlineWorkers] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [requestToAssign, setRequestToAssign] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchServiceRequests();
      fetchWorkers();
      fetchOnlineWorkers();
      setupSocketConnection();
      
      // Poll for online workers every 30 seconds
      const interval = setInterval(fetchOnlineWorkers, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const setupSocketConnection = () => {
    if (!user?.id) return;
    
    try {
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:3001');
        
        socket.emit('join', user.id);
        console.log('AdminServiceRequests: Connected to socket, joined room:', user.id);
        
        socket.on('new_notification', (notification) => {
          console.log('AdminServiceRequests: Received notification:', notification);
          
          toast({
            title: notification.title || 'New Service Request',
            description: notification.message || 'You have received a new service request',
          });
          
          // Always refresh service requests when any notification arrives
          fetchServiceRequests();
        });
        
        // Also listen for debug notifications
        socket.on('debug_notification', (data) => {
          console.log('AdminServiceRequests: Debug notification received:', data);
          if (data.adminId === user.id) {
            fetchServiceRequests();
          }
        });
      });
    } catch (error) {
      console.error('AdminServiceRequests: Socket connection error:', error);
    }
  };

  const fetchOnlineWorkers = async () => {
    try {
      console.log('Fetching logged-in workers...');
      const response = await fetch('http://localhost:3001/api/workers/logged-in');
      console.log('Logged-in workers response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Logged-in workers response:', data);
        const loggedInWorkers = data.workers || [];
        setOnlineWorkers(loggedInWorkers.map(w => w._id));
        console.log('Set logged-in worker IDs:', loggedInWorkers.map(w => w._id));
      } else {
        console.error('Failed to fetch logged-in workers:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch logged-in workers:', error);
    }
  };

  const fetchServiceRequests = async () => {
    if (!user?.id) return;
    
    try {
      console.log('AdminServiceRequests: Fetching requests for admin ID:', user.id);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/requests/admin/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('AdminServiceRequests: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('AdminServiceRequests: Received data:', data);
        console.log('AdminServiceRequests: Setting requests:', data.requests || data);
        setRequests(data.requests || data);
      } else {
        const errorText = await response.text();
        console.error('AdminServiceRequests: Failed to fetch requests:', response.status, errorText);
      }
    } catch (error) {
      console.error('AdminServiceRequests: Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      console.log('Fetching all workers from logged-in endpoint...');
      const response = await fetch('http://localhost:3001/api/workers/logged-in');
      console.log('Workers response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Logged-in workers data:', data);
        setWorkers(data.workers || []);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const assignWorker = async (requestId: string, workerId: string) => {
    try {
      console.log('Assigning worker:', { requestId, workerId });
      
      const response = await fetch(`http://localhost:3001/api/requests/${requestId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, status: 'worker-assigned' })
      });
      
      console.log('Assignment response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Assignment successful:', result);
        toast({ title: "Success", description: "Worker assigned successfully!" });
        setAssignDialogOpen(false);
        setRequestToAssign(null);
        fetchServiceRequests();
      } else {
        const errorData = await response.text();
        console.error('Assignment failed:', response.status, errorData);
        toast({ title: "Error", description: `Failed to assign worker: ${response.status}`, variant: "destructive" });
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast({ title: "Error", description: "Network error during assignment", variant: "destructive" });
    }
  };

  const openAssignDialog = async (request: ServiceRequest) => {
    setRequestToAssign(request);
    setAssignDialogOpen(true);
    fetchOnlineWorkers();
    fetchWorkers();
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
    <Card key={request.id} className="border-2 hover:shadow-lg transition-shadow h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{request.userName}</span>
          </div>
          <Badge variant={getStatusBadge(request.status) as any} className="text-xs">
            {request.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 gap-1">
            <p className="truncate"><strong>Service:</strong> {request.serviceName}</p>
            <p><strong>Type:</strong> {request.serviceType}</p>
            <p><strong>Date:</strong> {request.preferredDate} at {request.preferredTime}</p>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <p className="truncate"><strong>Location:</strong> {request.location}</p>
          <p className="line-clamp-2"><strong>Issue:</strong> {request.issueDescription}</p>
        </div>

        {request.quotation && (
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p><strong>Total Amount:</strong> ${request.quotation.total}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedRequest(request)}>
                <Eye className="h-3 w-3 mr-1" />
                View
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
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => openAssignDialog(request)}
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Assign
            </Button>
          )}
          </div>

          {request.status !== 'completed' && (
            <Select onValueChange={(status) => updateRequestStatus(request.id, status)}>
              <SelectTrigger className="w-full text-sm">
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
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
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
      
      {/* Worker Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Worker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Request Details</h4>
              <p className="text-sm text-muted-foreground">
                {requestToAssign?.serviceName} - {requestToAssign?.userName}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Available Workers</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(() => {
                  console.log('All workers:', workers);
                  console.log('Online worker IDs:', onlineWorkers);
                  const onlineWorkersList = workers.filter(worker => onlineWorkers.includes(worker._id));
                  console.log('Filtered online workers:', onlineWorkersList);
                  return onlineWorkersList.length === 0;
                })() ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No workers are currently online
                  </p>
                ) : (
                  workers
                    .filter(worker => onlineWorkers.includes(worker._id))
                    .map((worker) => (
                      <div 
                        key={worker._id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          console.log('Assigning to worker:', worker._id);
                          console.log('Request to assign:', requestToAssign);
                          console.log('Request ID:', requestToAssign?.id || requestToAssign?._id);
                          const requestId = requestToAssign?.id || requestToAssign?._id;
                          if (requestId) {
                            assignWorker(requestId, worker._id);
                          } else {
                            console.error('No request ID found');
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <div>
                            <p className="font-medium">{worker.firstName} {worker.lastName}</p>
                            <p className="text-xs text-muted-foreground">{worker.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Online
                        </Badge>
                      </div>
                    ))
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServiceRequests;