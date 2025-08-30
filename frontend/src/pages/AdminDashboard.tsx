import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { requestAPI } from "@/lib/api";

interface Request {
  _id: string;
  customer: string;
  service: string;
  location: string;
  status: "pending" | "assigned" | "completed";
  assignedWorker?: string;
}



const mockWorkers = ["Mike Johnson", "Sarah Davis", "Tom Brown", "Lisa Garcia"];

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    if (!token) return;
    
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
    if (!token) return;
    
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          onClick={() => toast({ title: "Notifications", description: "3 new service requests pending" })}
          className="bg-blue-600 hover:bg-blue-700"
        >
          🔔 Notifications
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No requests found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(request => (
          <Card key={request._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{request.customer} - {request.service}</span>
                <Badge variant={request.status === "pending" ? "destructive" : request.status === "assigned" ? "default" : "secondary"}>
                  {request.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Location: {request.location}</p>
              
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
                </div>
              )}
              
              {request.status === "assigned" && (
                <p className="text-sm">Assigned to: <strong>{request.assignedWorker}</strong></p>
              )}
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}