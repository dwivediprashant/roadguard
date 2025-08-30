import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const assignWorker = async (requestId: string, worker: string) => {
    try {
      await fetch(`http://localhost:3001/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'assigned', assignedWorker: worker })
      });
      fetchRequests();
    } catch (error) {
      console.error('Error assigning worker:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
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
    </div>
  );
}