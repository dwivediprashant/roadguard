import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  Settings, 
  Search, 
  Calendar, 
  List, 
  LayoutGrid, 
  Clock, 
  MapPin, 
  User,
  Filter,
  ArrowUpDown,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaskKanban } from '@/components/TaskKanban';
import { TaskCalendar } from '@/components/TaskCalendar';

interface Task {
  _id: string;
  title: string;
  clientName: string;
  serviceType: string;
  category: string;
  location: { address: string };
  scheduledTime: string;
  status: string;
  priority: string;
  distance?: number;
  upvotes: number;
}

const statusColors = {
  assigned: 'bg-blue-500',
  start_service: 'bg-yellow-500',
  reached: 'bg-orange-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  done: 'bg-gray-500'
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

export default function WorkerPortal() {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState('available');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [notifications, setNotifications] = useState(3);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        _id: '1',
        title: 'Emergency Battery Jump',
        clientName: 'John Doe',
        serviceType: 'Battery Jump',
        category: 'Emergency',
        location: { address: 'Main St & 5th Ave, Downtown' },
        scheduledTime: '2024-01-15T10:00:00Z',
        status: 'assigned',
        priority: 'high',
        distance: 2.5,
        upvotes: 12
      },
      {
        _id: '2',
        title: 'Tire Replacement Service',
        clientName: 'Jane Smith',
        serviceType: 'Tire Change',
        category: 'Maintenance',
        location: { address: 'Oak Rd & Pine St, Suburbs' },
        scheduledTime: '2024-01-15T14:00:00Z',
        status: 'start_service',
        priority: 'medium',
        distance: 5.2,
        upvotes: 8
      },
      {
        _id: '3',
        title: 'Fuel Delivery',
        clientName: 'Bob Wilson',
        serviceType: 'Fuel Delivery',
        category: 'Delivery',
        location: { address: 'Highway 101, Mile Marker 45' },
        scheduledTime: '2024-01-15T16:30:00Z',
        status: 'reached',
        priority: 'low',
        distance: 8.1,
        upvotes: 15
      }
    ];
    setTasks(mockTasks);
    setFilteredTasks(mockTasks);
  }, []);

  // Filter and sort tasks
  useEffect(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime();
      } else if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return 0;
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, categoryFilter, statusFilter, sortBy]);

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'in_service': return 'bg-yellow-500';
      case 'not_available': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-l-4"
      style={{ borderLeftColor: priorityColors[task.priority as keyof typeof priorityColors].replace('bg-', '#') }}
      onClick={() => navigate(`/worker/tasks/${task._id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <Badge 
            className={`${statusColors[task.status as keyof typeof statusColors]} text-white`}
          >
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{task.clientName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{task.location.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTime(task.scheduledTime)}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <Badge variant="outline">{task.serviceType}</Badge>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.distance && <span>{task.distance} km</span>}
            <span>↑ {task.upvotes}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Worker Portal</h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getAvailabilityColor()}`}></div>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_service">In Service</SelectItem>
                    <SelectItem value="not_available">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, clients, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="start_service">Started</SelectItem>
                <SelectItem value="reached">Reached</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="upvotes">Most Upvoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Tabs */}
        <Tabs value={view} onValueChange={setView} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map(task => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <TaskCalendar 
              tasks={filteredTasks} 
              onTaskClick={(taskId) => navigate(`/worker/tasks/${taskId}`)}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <TaskKanban 
              tasks={filteredTasks} 
              onTaskClick={(taskId) => navigate(`/worker/tasks/${taskId}`)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}