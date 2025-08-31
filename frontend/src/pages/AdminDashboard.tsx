import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import AdminServiceRequests from "@/components/AdminServiceRequests";
import { 
  Users, Settings, Bell, Search, Filter, Calendar, MapPin, Clock, 
  CheckCircle, XCircle, AlertCircle, User, Building2, Wrench, 
  BarChart3, TrendingUp, RefreshCw, Upload, Globe, ChevronDown,
  Shield, Crown, Settings2, UserCheck, History, Network
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, workers: 0 });
  const [filters, setFilters] = useState({ status: "all", distance: "all", sort: "newest" });
  const [loading, setLoading] = useState(true);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.firstName + " " + user?.lastName || "",
    role: user?.userType || "admin",
    employer: user?.shopName || "",
    language: "en",
    profileImage: ""
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    console.log('AdminDashboard: Fetching data for admin', user.id);
    
    try {
      const token = localStorage.getItem('token');
      console.log('AdminDashboard: Using token', token ? 'exists' : 'missing');
      
      const [requestsRes, usersRes] = await Promise.all([
        fetch(`http://localhost:3001/api/requests/admin/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/auth/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      console.log('AdminDashboard: Requests response status', requestsRes.status);
      console.log('AdminDashboard: Users response status', usersRes.status);

      let requestsData = [];
      let usersData = [];

      if (requestsRes.ok) {
        requestsData = await requestsRes.json();
        console.log('AdminDashboard: Requests data', requestsData);
      } else {
        console.error('AdminDashboard: Failed to fetch requests', requestsRes.status, await requestsRes.text());
      }
      
      if (usersRes.ok) {
        usersData = await usersRes.json();
        console.log('AdminDashboard: Users data', usersData);
      } else {
        console.error('AdminDashboard: Failed to fetch users', usersRes.status);
      }

      // Handle both array and object with requests property
      const finalRequestsData = requestsData.requests || requestsData;
      setRequests(Array.isArray(finalRequestsData) ? finalRequestsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      
      console.log('AdminDashboard: Final requests count', Array.isArray(finalRequestsData) ? finalRequestsData.length : 0);
      
      const stats = {
        total: finalRequestsData.length || 0,
        pending: finalRequestsData.filter(r => r.status === 'pending').length || 0,
        completed: finalRequestsData.filter(r => r.status === 'completed').length || 0,
        workers: usersData.filter(u => u.userType === 'worker').length || 0
      };
      setStats(stats);
      console.log('AdminDashboard: Stats', stats);

      const recentNotifications = finalRequestsData
        .filter(r => r.status === 'pending')
        .slice(0, 5)
        .map(r => ({
          id: r._id || r.id,
          type: 'request',
          title: 'New Service Request',
          message: `${r.userName || r.userId?.firstName || 'User'} needs ${r.urgency || 'medium'} priority assistance`,
          time: new Date(r.createdAt).toLocaleTimeString()
        }));
      setLocalNotifications(recentNotifications);
      console.log('AdminDashboard: Recent notifications', recentNotifications);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setRequests([]);
      setUsers([]);
      setStats({ total: 0, pending: 0, completed: 0, workers: 0 });
      setLocalNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
    setupSocketConnection();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const setupSocketConnection = () => {
    if (!user?.id) return;
    
    try {
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:3001');
        
        socket.emit('join', user.id);
        console.log('Admin connected to socket, joined room:', user.id);
        
        socket.on('new_notification', (notification) => {
          console.log('Admin received notification:', notification);
          
          toast({
            title: notification.title || 'New Notification',
            description: notification.message || 'You have a new notification',
          });
          
          // Refresh dashboard data to show new request
          fetchDashboardData();
        });
      });
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast({ title: "Success", description: `Request ${status}` });
        fetchDashboardData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update request", variant: "destructive" });
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "User role updated" });
        fetchDashboardData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filters.status !== "all" && request.status !== filters.status) return false;
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return filters.sort === "newest" ? dateB - dateA : dateA - dateB;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'worker': return <Settings2 className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-yellow-100 text-yellow-800",
      worker: "bg-blue-100 text-blue-800",
      user: "bg-gray-100 text-gray-800"
    };
    return <Badge className={colors[role]}>{role}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-xl font-bold">RoadGuard Admin</h1>
              <p className="text-sm text-gray-400">Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={fetchDashboardData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-xs px-1">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
            <Button variant="outline" onClick={logout} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "requests" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("requests")}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Service Requests
            </Button>
            <Button
              variant={activeTab === "users" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
            <Button
              variant={activeTab === "notifications" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-auto bg-red-500 text-xs px-1">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={activeTab === "hierarchy" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("hierarchy")}
            >
              <Network className="h-4 w-4 mr-2" />
              Organization
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Live Updates</Badge>
                  <span className="text-sm text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Requests</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
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
                        <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Workers</p>
                        <p className="text-2xl font-bold text-blue-500">{stats.workers}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notifications */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {localNotifications.length === 0 ? (
                      <p className="text-gray-400">No new notifications</p>
                    ) : (
                      localNotifications.map((notif) => (
                        <div key={notif.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-white">{notif.title}</p>
                            <p className="text-sm text-gray-400">{notif.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">{notif.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
              <AdminServiceRequests />
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              
              <div className="grid gap-4">
                {users.length === 0 ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-400">No users found</p>
                    </CardContent>
                  </Card>
                ) : (
                  users.map((user) => (
                    <Card key={user._id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-gray-700">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-400">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {getRoleIcon(user.userType)}
                                {getRoleBadge(user.userType)}
                              </div>
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                Edit Role
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Edit User Role</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-gray-300">User</Label>
                                  <p className="text-white">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                                </div>
                                <div>
                                  <Label className="text-gray-300">Current Role</Label>
                                  <p className="text-white">{selectedUser?.userType}</p>
                                </div>
                                <div>
                                  <Label className="text-gray-300">New Role</Label>
                                  <Select onValueChange={(value) => updateUserRole(selectedUser?._id, value)}>
                                    <SelectTrigger className="bg-gray-700 border-gray-600">
                                      <SelectValue placeholder="Select new role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin/Workshop Owner</SelectItem>
                                      <SelectItem value="worker">Worker</SelectItem>
                                      <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileData.profileImage} />
                      <AvatarFallback className="bg-gray-700 text-2xl">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="border-gray-600">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Full Name</Label>
                      <Input 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Role</Label>
                      <Select value={profileData.role} onValueChange={(value) => setProfileData({...profileData, role: value})}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin/Workshop Owner</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Current Employer</Label>
                      <Input 
                        value={profileData.employer}
                        onChange={(e) => setProfileData({...profileData, employer: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Language</Label>
                      <Select value={profileData.language} onValueChange={(value) => setProfileData({...profileData, language: value})}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button className="bg-green-600 hover:bg-green-700">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Work History */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Work History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {requests.filter(r => r.status === 'completed').slice(0, 3).map((request, i) => (
                      <div key={request._id || i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-white">Service Request #{request._id?.slice(-6) || `00${i+1}`}</p>
                          <p className="text-sm text-gray-400">{request.message || 'Completed vehicle service'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-500">Completed</p>
                          <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {requests.filter(r => r.status === 'completed').length === 0 && (
                      <p className="text-gray-400 text-center py-4">No completed work history</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Notifications</h2>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            notification.isRead ? 'bg-gray-700' : 'bg-blue-900/30 border border-blue-500/30'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              notification.isRead ? 'bg-gray-500' : 'bg-blue-500'
                            }`} />
                            <div>
                              <p className="font-medium text-white">{notification.title}</p>
                              <p className="text-sm text-gray-400">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as Read
                              </Button>
                            )}
                            {notification.requestId && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setActiveTab('requests')}
                              >
                                View Request
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "hierarchy" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Organization Hierarchy</h2>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      <div>
                        <p className="font-medium text-white">Admin Level</p>
                        <p className="text-sm text-gray-400">Workshop Owners & System Administrators</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 ml-auto">
                        {users.filter(u => u.userType === 'admin').length} users
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                      <Settings2 className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="font-medium text-white">Worker Level</p>
                        <p className="text-sm text-gray-400">Field Workers & Technicians</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 ml-auto">
                        {users.filter(u => u.userType === 'worker').length} users
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                      <User className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="font-medium text-white">User Level</p>
                        <p className="text-sm text-gray-400">Service Requesters & Customers</p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800 ml-auto">
                        {users.filter(u => u.userType === 'user').length} users
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;