import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Car, Clock, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
  const [requests, setRequests] = useState([
    { id: 1, service: 'Engine Repair', status: 'pending', location: 'Downtown', date: '2024-01-15' },
    { id: 2, service: 'Tire Change', status: 'completed', location: 'Highway 101', date: '2024-01-10' }
  ]);

  const createRequest = () => {
    const newRequest = {
      id: requests.length + 1,
      service: 'Battery Jump',
      status: 'pending',
      location: 'Current Location',
      date: new Date().toISOString().split('T')[0]
    };
    setRequests([newRequest, ...requests]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <Button onClick={createRequest} className="bg-blue-600 hover:bg-blue-700">
            Request Service
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
                </div>
                <Car className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-2xl font-bold">{requests.filter(r => r.status === 'completed').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>My Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium">{request.service}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {request.location} • {request.date}
                    </p>
                  </div>
                  <Badge variant={request.status === 'pending' ? 'destructive' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;