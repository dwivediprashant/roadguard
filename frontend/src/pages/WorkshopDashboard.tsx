import React, { useState, useEffect } from 'react';
import { Bell, User, X, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data
const mockRequests = [
  { id: 1, location: 'Downtown', status: 'open', distance: 2.5, rating: 4.8 },
  { id: 2, location: 'Mall Area', status: 'completed', distance: 1.2, rating: 4.9 },
  { id: 3, location: 'Highway 101', status: 'closed', distance: 5.1, rating: 4.6 },
  { id: 4, location: 'Business District', status: 'open', distance: 3.2, rating: 4.7 }
];

const chartData = [
  { name: 'Mon', completed: 12, pending: 3 },
  { name: 'Tue', completed: 15, pending: 2 },
  { name: 'Wed', completed: 8, pending: 5 },
  { name: 'Thu', completed: 18, pending: 1 },
  { name: 'Fri', completed: 22, pending: 4 }
];

const pieData = [
  { name: 'Completed', value: 75, color: '#10b981' },
  { name: 'Pending', value: 15, color: '#f59e0b' },
  { name: 'Cancelled', value: 10, color: '#ef4444' }
];

const WorkshopDashboard = () => {
  const [workshopOpen, setWorkshopOpen] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nearest');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const filteredRequests = mockRequests.filter(req => {
    if (showOpenOnly && req.status !== 'open') return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (distanceFilter === 'nearby' && req.distance > 3) return false;
    if (distanceFilter === 'farther' && req.distance <= 3) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'nearest') return a.distance - b.distance;
    if (sortBy === 'rated') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">New service request generated in your location Downtown. Click here to view more</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotification(false)}
              className="text-white hover:bg-blue-700 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Workshop Status Toggle */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setWorkshopOpen(!workshopOpen)}
            className={`${workshopOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${workshopOpen ? 'bg-green-300' : 'bg-red-300'}`} />
            {workshopOpen ? 'Open for Request' : 'Closed'}
          </Button>
        </div>

        {/* Center Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative border-gray-600 text-white hover:bg-gray-800"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                <User className="h-4 w-4 mr-2" />
                User
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem className="text-white hover:bg-gray-700">Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-700">Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-700">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="absolute top-16 right-6 bg-gray-800 border border-gray-600 rounded-lg p-4 w-80 z-40">
            <h3 className="font-medium mb-3">Notifications</h3>
            <div className="space-y-2">
              <div className="p-2 bg-gray-700 rounded text-sm">New request from Downtown</div>
              <div className="p-2 bg-gray-700 rounded text-sm">Service completed at Mall Area</div>
              <div className="p-2 bg-gray-700 rounded text-sm">Payment received for Highway 101</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOpen"
                checked={showOpenOnly}
                onCheckedChange={setShowOpenOnly}
                className="border-gray-600"
              />
              <label htmlFor="showOpen" className="text-sm">Show Open Only</label>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Distance</SelectItem>
                <SelectItem value="nearby">Nearby</SelectItem>
                <SelectItem value="farther">Farther</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="nearest">Nearest</SelectItem>
                <SelectItem value="rated">Most Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Card */}
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Service & Employee Performance Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Weekly Performance</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="completed" fill="#10b981" />
                    <Bar dataKey="pending" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-3">Request Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtered Requests */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Service Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRequests.map(req => (
                <div key={req.id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{req.location}</span>
                    <Badge variant={req.status === 'open' ? 'default' : req.status === 'completed' ? 'secondary' : 'destructive'}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div>Distance: {req.distance} km</div>
                    <div>Rating: {req.rating}/5</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkshopDashboard;