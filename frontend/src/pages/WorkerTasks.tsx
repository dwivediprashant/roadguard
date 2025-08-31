import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, MapPin, Clock, CheckCircle, Play } from "lucide-react";

interface Task {
  id: string;
  customer: string;
  service: string;
  status: string;
  date: string;
  time: string;
  location: string;
  description: string;
  workshopName: string;
  priority: string;
  createdAt: string;
}

const WorkerTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/requests/worker/${user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'worker-assigned': return 'bg-blue-500';
      case 'in-progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Task status updated!" });
        fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task status", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Assigned Tasks</h1>
              <p className="text-sm text-gray-400">Tasks assigned to you by admin</p>
            </div>
          </div>
          <Badge variant="outline" className="text-white border-gray-600">
            {tasks.length} Total Tasks
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="font-medium mb-2 text-white">No Tasks Assigned</h3>
              <p className="text-sm text-gray-400">You don't have any assigned tasks yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card key={task.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">{task.customer}</span>
                    </div>
                    <Badge className={`${getStatusColor(task.status)} text-white`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-white mb-2">{task.service}</h3>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>{task.date} at {task.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{task.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                      {task.priority} priority
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {task.status === 'worker-assigned' && (
                      <Button 
                        size="sm" 
                        className="bg-orange-600 hover:bg-orange-700 flex-1"
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start Task
                      </Button>
                    )}
                    {task.status === 'in-progress' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <Badge className="bg-green-500 text-white flex-1 justify-center">
                        Task Completed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerTasks;