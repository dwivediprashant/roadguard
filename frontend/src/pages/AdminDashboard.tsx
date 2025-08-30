import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { requestAPI } from "@/lib/api";
import { Bell, Users, Car, Settings, LogOut, TrendingUp, AlertTriangle } from "lucide-react";

interface Request {
  _id: string;
  customer: string;
  service: string;
  location: string;
  status: "pending" | "assigned" | "completed";
  assignedWorker?: string;
  createdAt: string;
}

const mockWorkers = ["Mike Johnson", "Sarah Davis", "Tom Brown", "Lisa Garcia"];

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await requestAPI.getAll();
      const data = response.data;
      setRequests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch requests. Please try again.",
        variant: "destructive"
      });
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const assignWorker = async (requestId: string, worker: string) => {
    try {
      await requestAPI.update(requestId, { status: 'assigned', assignedWorker: worker });
      
      toast({
        title: "Success",
        description: `Worker ${worker} assigned successfully.`
      });
      
      fetchRequests();
    } catch (error: any) {
      console.error('Error assigning worker:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign worker. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'assigned': return 'default';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const assignedRequests = requests.filter(r => r.status === 'assigned').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Welcome back, {user?.firstName} {user?.lastName}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => toast({ title: "Notifications", description: `${pendingRequests} new service requests pending` })}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pending Requests</p>
                  <p className="text-3xl font-bold">{pendingRequests}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Assigned Requests</p>
                  <p className="text-3xl font-bold">{assignedRequests}</p>
                </div>
                <Car className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed Requests</p>
                  <p className="text-3xl font-bold">{completedRequests}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Service Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No requests found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(request => (
                  <Card key={request._id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{request.customer} - {request.service}</h3>
                          <p className="text-sm text-muted-foreground">Location: {request.location}</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      {request.status === "pending" && (
                        <div className="flex gap-2 items-center">
                          <Select onValueChange={(worker) => assignWorker(request._id, worker)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select worker" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockWorkers.map(worker => (
                                <SelectItem key={worker} value={worker}>{worker}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={() => assignWorker(request._id, mockWorkers[0])}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Assign
                          </Button>
                        </div>
                      )}
                      
                      {request.status === "assigned" && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm">Assigned to: <strong>{request.assignedWorker}</strong></p>
                          <Button 
                            onClick={() => assignWorker(request._id, 'completed')}
                            size="sm"
                            variant="outline"
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}

                      {request.status === "completed" && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✓ Request completed successfully
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}