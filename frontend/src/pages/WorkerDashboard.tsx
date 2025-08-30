import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

interface Task {
  id: string;
  customer: string;
  service: string;
  location: string;
  date: string;
  time: string;
  status: "assigned" | "completed";
  comments?: string;
}

const mockTasks: Task[] = [
  { id: "1", customer: "John Doe", service: "Battery Jump", location: "Main St & 5th Ave", date: "2024-01-15", time: "10:00 AM", status: "assigned" },
  { id: "2", customer: "Jane Smith", service: "Tire Change", location: "Oak Rd & Pine St", date: "2024-01-15", time: "2:00 PM", status: "assigned" },
  { id: "3", customer: "Bob Wilson", service: "Fuel Delivery", location: "Highway 101", date: "2024-01-14", time: "9:00 AM", status: "completed", comments: "Delivered 5 gallons of gas. Customer was very satisfied." },
];

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: "completed" as const, comments: comments[taskId] || "" }
        : task
    ));
    setComments(prev => ({ ...prev, [taskId]: "" }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
      
      <div className="grid gap-4">
        {tasks.map(task => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{task.customer} - {task.service}</span>
                <Badge variant={task.status === "assigned" ? "default" : "secondary"}>
                  {task.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {task.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {task.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {task.time}
                </div>
              </div>
              
              {task.status === "assigned" && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add completion comments..."
                    value={comments[task.id] || ""}
                    onChange={(e) => setComments(prev => ({ ...prev, [task.id]: e.target.value }))}
                  />
                  <Button onClick={() => completeTask(task.id)}>
                    Mark as Completed
                  </Button>
                </div>
              )}
              
              {task.status === "completed" && task.comments && (
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-medium mb-1">Completion Notes:</p>
                  <p className="text-sm">{task.comments}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}