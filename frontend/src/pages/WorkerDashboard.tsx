import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings2, MapPin, Clock, CheckCircle, AlertCircle, 
  Navigation, Phone, User, Calendar, TrendingUp,
  RefreshCw, Play, Pause, Square
} from "lucide-react";

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, completed: 0, inProgress: 0 });
  const [availability, setAvailability] = useState('available');
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/worker/tasks/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        
        const stats = {
          assigned: data.filter(t => t.status === 'assigned').length,
          inProgress: data.filter(t => t.status === 'in_progress').length,
          completed: data.filter(t => t.status === 'completed').length
        };
        setStats(stats);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await fetch(`http://localhost:3001/api/worker/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      toast({ title: "Success", description: `Task ${status}` });
      fetchTasks();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const updateAvailability = async (newStatus) => {
    try {
      await fetch(`http://localhost:3001/api/worker/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newStatus })
      });
      setAvailability(newStatus);
      toast({ title: "Success", description: `Status updated to ${newStatus}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Settings2 className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">Worker Dashboard</h1>
              <p className="text-sm text-gray-400">Field Operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(availability)}`} />
              <span className="text-sm capitalize">{availability}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchTasks} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={logout} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Assigned Tasks</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.assigned}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.inProgress}</p>
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
                  <p className="text-sm text-gray-400">Availability</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant={availability === 'available' ? 'default' : 'outline'}
                      onClick={() => updateAvailability('available')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Available
                    </Button>
                    <Button
                      size="sm"
                      variant={availability === 'busy' ? 'default' : 'outline'}
                      onClick={() => updateAvailability('busy')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      Busy
                    </Button>
                    <Button
                      size="sm"
                      variant={availability === 'offline' ? 'default' : 'outline'}
                      onClick={() => updateAvailability('offline')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Offline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tasks */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active tasks</p>
              ) : (
                tasks.map((task) => (
                  <Card key={task._id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-gray-600">
                              {task.userId?.firstName?.[0]}{task.userId?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">
                              {task.userId?.firstName} {task.userId?.lastName}
                            </p>
                            <p className="text-sm text-gray-400">Task #{task._id.slice(-6)}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{task.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{new Date(task.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{task.message}</p>
                      
                      <div className="flex space-x-2">
                        {task.status === 'assigned' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => updateTaskStatus(task._id, 'in_progress')}
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateTaskStatus(task._id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                <p className="text-sm text-gray-400">Tasks Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">4.8</p>
                <p className="text-sm text-gray-400">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">95%</p>
                <p className="text-sm text-gray-400">On-Time Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerDashboard;