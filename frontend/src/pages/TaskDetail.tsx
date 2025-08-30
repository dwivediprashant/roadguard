import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  DollarSign,
  MessageSquare,
  Navigation,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  category: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  scheduledTime: string;
  status: string;
  quotation: {
    baseCost: number;
    additionalCosts: Array<{ item: string; cost: number }>;
    totalCost: number;
  };
  notes: Array<{
    message: string;
    timestamp: string;
    sender: 'worker' | 'client';
  }>;
  liveLocation?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

const statusSteps = [
  { key: 'assigned', label: 'Assigned', icon: Circle },
  { key: 'start_service', label: 'Start Service', icon: Circle },
  { key: 'reached', label: 'Reached Location', icon: Circle },
  { key: 'in_progress', label: 'Service in Progress', icon: Circle },
  { key: 'completed', label: 'Service Completed', icon: Circle },
  { key: 'done', label: 'Done & Invoiced', icon: CheckCircle }
];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockTask: Task = {
      _id: id || '1',
      title: 'Emergency Battery Jump Service',
      description: 'Customer vehicle won\'t start due to dead battery. Located in downtown parking garage, level 2. Vehicle is a 2019 Honda Civic, silver color. Customer will be waiting by the vehicle.',
      clientName: 'John Doe',
      clientPhone: '+1 (555) 123-4567',
      serviceType: 'Battery Jump',
      category: 'Emergency',
      location: {
        address: 'Main St & 5th Ave, Downtown Parking Garage Level 2',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      scheduledTime: '2024-01-15T10:00:00Z',
      status: 'start_service',
      quotation: {
        baseCost: 75,
        additionalCosts: [
          { item: 'Emergency surcharge', cost: 25 },
          { item: 'Parking fee', cost: 5 }
        ],
        totalCost: 105
      },
      notes: [
        {
          message: 'Customer confirmed location and will be waiting by the vehicle',
          timestamp: '2024-01-15T09:45:00Z',
          sender: 'client'
        },
        {
          message: 'On my way to location, ETA 15 minutes',
          timestamp: '2024-01-15T09:50:00Z',
          sender: 'worker'
        }
      ]
    };
    setTask(mockTask);
  }, [id]);

  const getCurrentStepIndex = () => {
    if (!task) return 0;
    return statusSteps.findIndex(step => step.key === task.status);
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / statusSteps.length) * 100;
  };

  const updateStatus = async (newStatus: string) => {
    if (!task) return;
    
    setIsUpdatingStatus(true);
    try {
      // API call would go here
      setTask({ ...task, status: newStatus });
      
      // Auto-generate invoice notification for completed status
      if (newStatus === 'completed') {
        // Show success message about invoice generation
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !task) return;
    
    const note = {
      message: newNote,
      timestamp: new Date().toISOString(),
      sender: 'worker' as const
    };
    
    setTask({
      ...task,
      notes: [...task.notes, note]
    });
    setNewNote('');
  };

  const shareLocation = () => {
    setSharingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // API call to update live location would go here
          console.log('Location shared:', position.coords);
          setSharingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setSharingLocation(false);
        }
      );
    }
  };

  const getNextStatus = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < statusSteps.length - 1) {
      return statusSteps[currentIndex + 1].key;
    }
    return null;
  };

  if (!task) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/worker')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <p className="text-muted-foreground">Task ID: {task._id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{task.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{task.clientName}</p>
                      <p className="text-sm text-muted-foreground">Client</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{task.clientPhone}</p>
                      <p className="text-sm text-muted-foreground">Contact</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(task.scheduledTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Scheduled Time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{task.serviceType}</Badge>
                    <Badge variant="secondary">{task.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{task.location.address}</p>
                <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                  <p className="text-muted-foreground">Map integration would go here</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1">
                    Open in Maps
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={shareLocation}
                    disabled={sharingLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {sharingLocation ? 'Sharing...' : 'Share Location'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Communication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {task.notes.map((note, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg ${
                        note.sender === 'worker' 
                          ? 'bg-primary/10 ml-8' 
                          : 'bg-muted mr-8'
                      }`}
                    >
                      <p className="text-sm">{note.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.sender === 'worker' ? 'You' : task.clientName} • {' '}
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note or message..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addNote} disabled={!newNote.trim()}>
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Progress value={getProgressPercentage()} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Step {getCurrentStepIndex() + 1} of {statusSteps.length}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {statusSteps.map((step, index) => {
                    const currentIndex = getCurrentStepIndex();
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const IconComponent = isCompleted ? CheckCircle : Circle;
                    
                    return (
                      <div 
                        key={step.key}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          isCurrent ? 'bg-primary/10' : ''
                        }`}
                      >
                        <IconComponent 
                          className={`h-5 w-5 ${
                            isCompleted 
                              ? 'text-green-500' 
                              : isCurrent 
                                ? 'text-primary' 
                                : 'text-muted-foreground'
                          }`}
                        />
                        <span className={`text-sm ${
                          isCurrent ? 'font-medium' : ''
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {getNextStatus() && (
                  <Button 
                    className="w-full" 
                    onClick={() => updateStatus(getNextStatus()!)}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? 'Updating...' : `Mark as ${statusSteps[getCurrentStepIndex() + 1]?.label}`}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quotation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Quotation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Service</span>
                  <span>${task.quotation.baseCost}</span>
                </div>
                
                {task.quotation.additionalCosts.map((cost, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cost.item}</span>
                    <span>${cost.cost}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${task.quotation.totalCost}</span>
                </div>
                
                {task.status === 'completed' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Invoice Generated</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Customer has been notified automatically
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}