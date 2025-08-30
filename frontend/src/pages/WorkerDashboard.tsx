import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import axios from "axios";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "assigned" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignedBy: {
    firstName: string;
    lastName: string;
  };
  comments: Array<{
    text: string;
    addedBy: {
      firstName: string;
      lastName: string;
    };
    addedAt: string;
  }>;
}



export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('taskUpdate', (updatedTask: Task) => {
        setTasks(prev => prev.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ));
      });

      return () => {
        socket.off('taskUpdate');
      };
    }
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/tasks/worker/calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/tasks/${taskId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add comment if provided
      if (comments[taskId]) {
        await axios.post(`http://localhost:3001/api/tasks/${taskId}/comments`, {
          text: comments[taskId]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await fetchTasks();
      setComments(prev => ({ ...prev, [taskId]: "" }));
      toast.success('Task completed successfully');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <NotificationBell />
      </div>
      
      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No tasks assigned yet
            </CardContent>
          </Card>
        ) : (
          tasks.map(task => (
            <Card key={task._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{task.title}</span>
                  <div className="flex gap-2">
                    <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                      {task.priority}
                    </Badge>
                    <Badge variant={task.status === "assigned" ? "default" : task.status === "completed" ? "secondary" : "outline"}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(task.dueDate).toLocaleTimeString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assigned by: {task.assignedBy.firstName} {task.assignedBy.lastName}
                  </p>
                </div>
                
                {task.status !== "completed" && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add completion comments..."
                      value={comments[task._id] || ""}
                      onChange={(e) => setComments(prev => ({ ...prev, [task._id]: e.target.value }))}
                    />
                    <Button onClick={() => completeTask(task._id)}>
                      Mark as Completed
                    </Button>
                  </div>
                )}
                
                {task.comments.length > 0 && (
                  <div className="bg-muted p-3 rounded mt-4">
                    <p className="text-sm font-medium mb-2">Comments:</p>
                    {task.comments.map((comment, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p className="text-sm">{comment.text}</p>
                        <p className="text-xs text-muted-foreground">
                          - {comment.addedBy.firstName} {comment.addedBy.lastName} on {new Date(comment.addedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}