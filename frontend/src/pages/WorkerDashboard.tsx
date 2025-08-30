import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import NotificationPopup from "@/components/NotificationPopup";
import { 
  Settings2, Bell, User, Search, Calendar, List, Grid3X3, 
  MapPin, Clock, DollarSign, MessageCircle, Navigation,
  CheckCircle, Play, ArrowRight, Phone, Send, Map
} from "lucide-react";

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState('available');
  const [view, setView] = useState('calendar');
  const [filters, setFilters] = useState({ category: 'all', status: 'all', distance: 'all', sort: 'recent' });
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [popupNotifications, setPopupNotifications] = useState([]);

  const mockTasks = [
    {
      id: 1,
      customer: "John Smith",
      service: "Engine Repair",
      category: "repair",
      status: "assigned",
      date: "2024-01-20",
      time: "10:00 AM",
      location: "123 Main St, Downtown",
      distance: "2.5 km",
      description: "Engine making unusual noise, needs diagnostic check",
      charges: { service: 150, variable: 50, parts: 200, total: 400 },
      progress: "assigned"
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      service: "Brake Service",
      category: "maintenance",
      status: "in_progress",
      date: "2024-01-20",
      time: "2:00 PM",
      location: "456 Oak Ave, Midtown",
      distance: "1.8 km",
      description: "Brake pads replacement and fluid check",
      charges: { service: 120, variable: 30, parts: 80, total: 230 },
      progress: "reached"
    }
  ];

  useEffect(() => {
    setTasks(mockTasks);
    setNotifications([
      { id: 1, message: "New Request #1001 Assigned. Click here to view more", time: "2 min ago" },
      { id: 2, message: "Payment received for Job #998", time: "15 min ago" }
    ]);
    
    // Simulate new request notification
    setTimeout(() => {
      const newNotification = {
        id: Date.now().toString(),
        type: 'info' as const,
        title: 'New Request Assigned',
        message: 'Request #1003 has been assigned to you. Click to view details.',
        action: () => setSelectedTask(mockTasks[0]),
        actionLabel: 'View Details',
        autoClose: false
      };
      setPopupNotifications([newNotification]);
    }, 3000);
  }, []);

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in_service': return 'bg-orange-500';
      case 'not_available': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
=======
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
>>>>>>> 9a5fd9bf1f571447fa7bb18cbb8074157c8d868f
  };

  const getProgressSteps = (progress) => {
    const steps = ['assigned', 'start_service', 'reached', 'done'];
    return steps.map(step => ({
      name: step.replace('_', ' ').toUpperCase(),
      completed: steps.indexOf(progress) >= steps.indexOf(step)
    }));
  };

  const updateProgress = (taskId, newProgress) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress: newProgress } : task
    ));
    toast({ title: "Progress Updated", description: `Task marked as ${newProgress.replace('_', ' ')}` });
  };

  const closePopupNotification = (id) => {
    setPopupNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (searchQuery && !task.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const CalendarView = () => (
    <div className="grid grid-cols-7 gap-4">
      <div className="col-span-7 grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-gray-400 font-medium py-2">{day}</div>
        ))}
      </div>
      {Array.from({ length: 35 }, (_, i) => (
        <div key={i} className="min-h-24 bg-gray-800 rounded-lg p-2 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">{((i % 31) + 1)}</div>
          {i === 19 && (
            <div className="space-y-1">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(task.status)} text-white`}
                  onClick={() => setSelectedTask(task)}
                >
                  {task.service}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {filteredTasks.map(task => (
        <Card key={task.id} className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750" onClick={() => setSelectedTask(task)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                <div>
                  <h3 className="font-medium text-white">{task.service}</h3>
                  <p className="text-sm text-gray-400">{task.customer} • {task.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">{task.distance}</p>
                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-4 gap-6">
      {['assigned', 'in_progress', 'completed', 'done'].map(status => (
        <div key={status} className="space-y-4">
          <h3 className="font-medium text-white capitalize">{status.replace('_', ' ')}</h3>
          <div className="space-y-3">
            {filteredTasks.filter(task => task.status === status || task.progress === status).map(task => (
              <Card key={task.id} className="bg-gray-800 border-gray-700 cursor-pointer" onClick={() => setSelectedTask(task)}>
                <CardContent className="p-3">
                  <h4 className="font-medium text-white text-sm">{task.service}</h4>
                  <p className="text-xs text-gray-400">{task.customer}</p>
                  <p className="text-xs text-gray-500">{task.time}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Settings2 className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">Worker Dashboard</h1>
              <p className="text-sm text-gray-400">Service Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Availability Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(availability)}`} />
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_service">In Service</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-xs px-1">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="font-medium mb-3">Notifications</h3>
                    <div className="space-y-2">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-2 bg-gray-700 rounded text-sm">
                          <p>{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-700">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{user?.firstName}</span>
            </div>

            <Button variant="outline" onClick={logout} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-800 border-gray-700"
              />
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sort} onValueChange={(value) => setFilters({...filters, sort: value})}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="quoted">Most Quoted</SelectItem>
                <SelectItem value="distance">By Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <Button
              variant={view === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-6">
          {view === 'calendar' && <CalendarView />}
          {view === 'list' && <ListView />}
          {view === 'kanban' && <KanbanView />}
        </div>

        {/* Service Detail Modal */}
        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Service Details</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-white mb-2">Customer Information</h3>
                    <p className="text-gray-300">{selectedTask.customer}</p>
                    <p className="text-sm text-gray-400">{selectedTask.service}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Service Details</h3>
                    <p className="text-gray-300">{selectedTask.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{selectedTask.date} at {selectedTask.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{selectedTask.distance}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Location</h3>
                    <p className="text-gray-300">{selectedTask.location}</p>
                    <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                      <Navigation className="h-4 w-4 mr-1" />
                      Navigate
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-2">Quotation</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service Charges:</span>
                        <span className="text-white">${selectedTask.charges.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Variable Cost:</span>
                        <span className="text-white">${selectedTask.charges.variable}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Spare Parts:</span>
                        <span className="text-white">${selectedTask.charges.parts}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t border-gray-600 pt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-green-500">${selectedTask.charges.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Progress Tracker */}
                  <div>
                    <h3 className="font-medium text-white mb-4">Progress Tracker</h3>
                    <div className="space-y-3">
                      {getProgressSteps(selectedTask.progress).map((step, index) => (
                        <div key={step.name} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500' : 'bg-gray-600'
                          }`}>
                            {step.completed && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          <span className={step.completed ? 'text-white' : 'text-gray-400'}>
                            {step.name}
                          </span>
                          {!step.completed && index === getProgressSteps(selectedTask.progress).findIndex(s => !s.completed) && (
                            <Button
                              size="sm"
                              className="ml-auto bg-orange-600 hover:bg-orange-700"
                              onClick={() => updateProgress(selectedTask.id, ['assigned', 'start_service', 'reached', 'done'][index])}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Update
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Messaging */}
                  <div>
                    <h3 className="font-medium text-white mb-2">Communication</h3>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Send a message or note..."
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Send className="h-3 w-3 mr-1" />
                          Send Message
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600">
                          <Map className="h-3 w-3 mr-1" />
                          Share Location
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Notification Popups */}
        <NotificationPopup 
          notifications={popupNotifications} 
          onClose={closePopupNotification} 
        />
=======
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
>>>>>>> 9a5fd9bf1f571447fa7bb18cbb8074157c8d868f
      </div>
    </div>
  );
}