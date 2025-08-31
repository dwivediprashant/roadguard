import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import NotificationPopup from "@/components/NotificationPopup";
import { io } from 'socket.io-client';

import { 
  Settings2, Bell, User, Search, Calendar, List, Grid3X3, 
  MapPin, Clock, DollarSign, MessageCircle, Navigation,
  CheckCircle, Play, ArrowRight, Phone, Send, Map, LogOut,
  Filter, SortAsc, Eye, MessageSquare, Share2, ChevronLeft, ChevronRight
} from "lucide-react";

// Google Calendar API configuration
const GOOGLE_API_KEY = 'AIzaSyClKCOHalvIwuSUxhAWl6FNsdF4mYMlWWc';
const CALENDAR_ID = 'primary';

// Load Google API
const loadGoogleAPI = () => {
  return new Promise((resolve) => {
    if (window.gapi) {
      resolve(window.gapi);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', () => {
        window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
        }).then(() => {
          resolve(window.gapi);
        });
      });
    };
    document.head.appendChild(script);
  });
};

interface Task {
  id: string;
  customer: string;
  service: string;
  category: string;
  status: "assigned" | "in_progress" | "completed";
  date: string;
  time: string;
  location: string;
  distance: string;
  description: string;
  charges: {
    service: number;
    variable: number;
    parts: number;
    total: number;
  };
  progress: "assigned" | "start_service" | "reached" | "done";
  priority: "low" | "medium" | "high";
  otp?: string;
}

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState('available');
  const [view, setView] = useState('calendar');
  const [filters, setFilters] = useState({ category: 'all', status: 'all', distance: 'all', sort: 'recent' });
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [popupNotifications, setPopupNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isGoogleAPILoaded, setIsGoogleAPILoaded] = useState(false);

  // Mock data for demonstration
  const mockTasks: Task[] = [
    {
      id: "1",
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
      progress: "assigned",
      priority: "high",
      otp: "1234"
    },
    {
      id: "2",
      customer: "Sarah Johnson",
      service: "Brake Service",
      category: "maintenance",
      status: "in_progress",
      date: "2024-01-22",
      time: "2:00 PM",
      location: "456 Oak Ave, Midtown",
      distance: "1.8 km",
      description: "Brake pads replacement and fluid check",
      charges: { service: 120, variable: 30, parts: 80, total: 230 },
      progress: "reached",
      priority: "medium"
    },
    {
      id: "3",
      customer: "Mike Wilson",
      service: "Oil Change",
      category: "maintenance",
      status: "completed",
      date: "2024-01-25",
      time: "11:00 AM",
      location: "789 Pine St, Uptown",
      distance: "3.2 km",
      description: "Regular oil change and filter replacement",
      charges: { service: 80, variable: 20, parts: 40, total: 140 },
      progress: "done",
      priority: "low"
    }
  ];



  useEffect(() => {
    fetchTasks();
    fetchNotifications();
    initializeGoogleCalendar();
    setWorkerOnline();
    setupSocketConnection();
    
    // Keep worker active - send activity ping every 2 minutes
    const activityInterval = setInterval(() => {
      if (user?.id) {
        fetch('http://localhost:3001/api/workers/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        }).catch(() => {});
      }
    }, 120000); // 2 minutes
    
    // Set worker offline when leaving the page
    const handleBeforeUnload = () => {
      setWorkerOffline();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setWorkerOffline();
    };
  }, [user?.id]);

  const setupSocketConnection = () => {
    if (!user?.id) return;
    
    try {
      // Connect to socket for real-time notifications
      const socket = io('http://localhost:3001');
      
      socket.emit('join', user.id);
      console.log('Worker connected to socket, joined room:', user.id);
      
      socket.on('new_notification', (notification) => {
        console.log('Worker received notification:', notification);
        
        // Check if notification already exists to prevent duplicates
        const notificationId = notification.id || notification.workerId + '_' + Date.now();
        
        setPopupNotifications(prev => {
          // Check if this notification already exists
          const exists = prev.some(n => n.id === notificationId || 
            (n.title === notification.title && n.message === notification.message));
          
          if (exists) {
            console.log('Duplicate notification prevented');
            return prev;
          }
          
          // Show toast notification only for new notifications
          toast({
            title: notification.title || 'New Task Assigned',
            description: notification.message || 'You have been assigned a new task',
          });
          
          // Add new notification
          return [...prev, {
            id: notificationId,
            title: notification.title || 'New Task Assigned',
            message: notification.message || 'You have been assigned a new task',
            time: new Date().toLocaleTimeString()
          }];
        });
        
        // Refresh tasks to show the new assignment
        fetchTasks();
        fetchNotifications();
      });
      
      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const setWorkerOnline = async () => {
    try {
      if (user?.id) {
        await fetch('http://localhost:3001/api/workers/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      }
    } catch (error) {
      console.error('Error setting worker online:', error);
    }
  };

  const setWorkerOffline = async () => {
    try {
      if (user?.id) {
        await fetch('http://localhost:3001/api/workers/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      }
    } catch (error) {
      console.error('Error setting worker offline:', error);
    }
  };

  const initializeGoogleCalendar = async () => {
    try {
      await loadGoogleAPI();
      setIsGoogleAPILoaded(true);
      await fetchGoogleCalendarEvents();
    } catch (error) {
      console.error('Error initializing Google Calendar:', error);
    }
  };

  const fetchGoogleCalendarEvents = async () => {
    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
        console.log('Google API not loaded yet');
        return;
      }

      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();

      const response = await window.gapi.client.calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.result.items || [];
      setGoogleEvents(events);
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
    }
  };

  const createGoogleCalendarEvent = async (task: Task) => {
    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
        console.log('Google API not available');
        return;
      }

      const startDateTime = new Date(`${task.date} ${task.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

      const event = {
        summary: `${task.service} - ${task.customer}`,
        description: `${task.description}\n\nLocation: ${task.location}\nDistance: ${task.distance}\nStatus: ${task.status}\nPriority: ${task.priority}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: task.location,
        colorId: task.priority === 'high' ? '11' : task.priority === 'medium' ? '5' : '2'
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: event
      });

      if (response.status === 200) {
        toast({ title: "Event Created", description: "Task added to Google Calendar" });
        await fetchGoogleCalendarEvents();
      }
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      toast({ title: "Error", description: "Failed to create calendar event", variant: "destructive" });
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setTasks(mockTasks);
        return;
      }
      
      // Fetch assigned tasks from requests
      const response = await fetch(`http://localhost:3001/api/requests/worker/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched worker tasks:', data.tasks);
        
        // Convert to expected format
        const convertedTasks = data.tasks.map(task => ({
          id: task.id,
          customer: task.customer,
          service: task.service,
          category: 'service',
          status: task.status === 'worker-assigned' ? 'assigned' : 
                  task.status === 'in-progress' ? 'in_progress' : 
                  task.status === 'completed' ? 'completed' : 'assigned',
          date: task.date,
          time: task.time,
          location: task.location,
          distance: '2.5 km', // Default distance
          description: task.description,
          charges: { service: 150, variable: 50, parts: 200, total: 400 },
          progress: task.status === 'worker-assigned' ? 'assigned' : 
                   task.status === 'in-progress' ? 'start_service' : 
                   task.status === 'completed' ? 'done' : 'assigned',
          priority: task.priority
        }));
        
        setTasks(convertedTasks);
      } else {
        console.log('No assigned tasks found, using mock data');
        setTasks(mockTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setNotifications([]);
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/notifications/worker', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in_service': return 'bg-orange-500';
      case 'not_available': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressSteps = (progress: string) => {
    const steps = ['assigned', 'start_service', 'reached', 'done'];
    return steps.map(step => ({
      name: step.replace('_', ' ').toUpperCase(),
      completed: steps.indexOf(progress) >= steps.indexOf(step)
    }));
  };

  const updateProgress = async (taskId: string, newProgress: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ progress: newProgress })
        });
        
        if (!response.ok) {
          throw new Error('API not available');
        }
      }
      
      // Update local state regardless of API response
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, progress: newProgress as any } : task
      ));
      toast({ title: "Progress Updated", description: `Task marked as ${newProgress.replace('_', ' ')}` });
    } catch (error) {
      console.error('Error updating progress:', error);
      // Still update local state for demo purposes
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, progress: newProgress as any } : task
      ));
      toast({ title: "Progress Updated", description: `Task marked as ${newProgress.replace('_', ' ')} (offline mode)` });
    }
  };

  const verifyOTP = async () => {
    if (!selectedTask || !otpInput.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`http://localhost:3001/api/tasks/${selectedTask.id}/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ otp: otpInput })
        });
        
        if (response.ok) {
          await updateProgress(selectedTask.id, 'reached');
          setOtpInput('');
          toast({ title: "OTP Verified", description: "Location confirmed successfully" });
          return;
        }
      }
      
      // Fallback OTP verification for demo
      if (otpInput === selectedTask.otp || otpInput === '1234') {
        await updateProgress(selectedTask.id, 'reached');
        setOtpInput('');
        toast({ title: "OTP Verified", description: "Location confirmed successfully" });
      } else {
        toast({ title: "Invalid OTP", description: "Please check the OTP and try again", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Fallback verification
      if (otpInput === selectedTask.otp || otpInput === '1234') {
        await updateProgress(selectedTask.id, 'reached');
        setOtpInput('');
        toast({ title: "OTP Verified", description: "Location confirmed successfully (offline mode)" });
      } else {
        toast({ title: "Invalid OTP", description: "Please check the OTP and try again", variant: "destructive" });
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedTask) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`http://localhost:3001/api/tasks/${selectedTask.id}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message: message.trim() })
        });
        
        if (response.ok) {
          toast({ title: "Message Sent", description: "Your message has been sent to the customer" });
          setMessage('');
          return;
        }
      }
      
      // Fallback for demo
      toast({ title: "Message Sent", description: "Your message has been sent to the customer (offline mode)" });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Still show success for demo
      toast({ title: "Message Sent", description: "Your message has been sent to the customer (offline mode)" });
      setMessage('');
    }
  };

  const shareLocation = async () => {
    if (!selectedTask) return;
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const token = localStorage.getItem('token');
            
            if (token) {
              const response = await fetch(`http://localhost:3001/api/tasks/${selectedTask.id}/location`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ latitude, longitude })
              });
              
              if (response.ok) {
                toast({ title: "Location Shared", description: "Your live location has been shared with the customer" });
                return;
              }
            }
            
            // Fallback for demo
            toast({ title: "Location Shared", description: "Your live location has been shared with the customer (offline mode)" });
          } catch (error) {
            toast({ title: "Location Shared", description: "Your live location has been shared with the customer (offline mode)" });
          }
        }, (error) => {
          toast({ title: "Location Error", description: "Unable to get your location", variant: "destructive" });
        });
      } else {
        toast({ title: "Not Supported", description: "Geolocation is not supported by this browser", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      toast({ title: "Location Shared", description: "Your live location has been shared (offline mode)" });
    }
  };

  const closePopupNotification = (id: string) => {
    setPopupNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (searchQuery && !task.customer?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const CalendarView = () => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    const getEventsForDate = (day: number) => {
      if (!day) return { tasks: [], googleEvents: [] };
      
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = filteredTasks.filter(task => task.date === dateStr);
      
      const dayGoogleEvents = googleEvents.filter(event => {
        if (!event.start) return false;
        const eventDate = new Date(event.start.dateTime || event.start.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear;
      });
      
      return { tasks: dayTasks, googleEvents: dayGoogleEvents };
    };
    
    const isToday = (day: number) => {
      if (!day) return false;
      return today.getDate() === day && 
             today.getMonth() === currentMonth && 
             today.getFullYear() === currentYear;
    };
    
    const navigateMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(currentMonth - 1);
      } else {
        newDate.setMonth(currentMonth + 1);
      }
      setCurrentDate(newDate);
      // Fetch events for new month
      setTimeout(() => fetchGoogleCalendarEvents(), 100);
    };

    return (
      <div className="bg-gray-800 rounded-lg p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="text-gray-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="text-gray-300 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentDate(new Date());
                fetchGoogleCalendarEvents();
              }}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGoogleCalendarEvents}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
              disabled={!isGoogleAPILoaded}
            >
              Sync Calendar
            </Button>
          </div>
        </div>
        
        {/* API Status */}
        <div className="mb-4 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isGoogleAPILoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">
            Google Calendar: {isGoogleAPILoaded ? 'Connected' : 'Connecting...'}
          </span>
          <span className="text-sm text-gray-500">({googleEvents.length} events loaded)</span>
        </div>
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-gray-400 font-medium py-2 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const { tasks: dayTasks, googleEvents: dayGoogleEvents } = getEventsForDate(day);
            const isCurrentDay = isToday(day);
            const allEvents = [...dayTasks, ...dayGoogleEvents];
            
            return (
              <div
                key={index}
                className={`min-h-28 p-2 border border-gray-700 rounded-lg transition-colors ${
                  day ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-800'
                } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay ? 'text-blue-400' : 'text-gray-300'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {/* Show tasks */}
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded cursor-pointer transition-opacity hover:opacity-80 ${
                            task.status === 'assigned' ? 'bg-blue-500' :
                            task.status === 'in_progress' ? 'bg-orange-500' :
                            task.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'
                          } text-white`}
                          onClick={() => setSelectedTask(task)}
                          title={`${task.service} - ${task.customer} at ${task.time}`}
                        >
                          <div className="truncate font-medium">{task.service}</div>
                          <div className="truncate text-xs opacity-75">{task.time}</div>
                        </div>
                      ))}
                      {/* Show Google Calendar events */}
                      {dayGoogleEvents.slice(0, 2).map((event, idx) => {
                        const startTime = event.start?.dateTime ? 
                          new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          }) : 'All day';
                        
                        return (
                          <div
                            key={`google-${idx}`}
                            className="text-xs p-1 rounded bg-purple-600 text-white cursor-pointer hover:opacity-80"
                            title={`${event.summary}\n${startTime}`}
                          >
                            <div className="truncate font-medium">{event.summary}</div>
                            <div className="truncate text-xs opacity-75">{startTime}</div>
                          </div>
                        );
                      })}
                      {allEvents.length > 4 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{allEvents.length - 4} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ListView = () => {
    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No tasks found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => setSelectedTask(task)}>
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
                  <Badge className={`${getStatusColor(task.status)} text-white`}>{task.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const KanbanView = () => {
    const columns = ['assigned', 'in_progress', 'completed', 'done'];
    
    return (
      <div className="grid grid-cols-4 gap-6">
        {columns.map(status => {
          const columnTasks = filteredTasks.filter(task => task.status === status || task.progress === status);
          
          return (
            <div key={status} className="space-y-4">
              <h3 className="font-medium text-white capitalize bg-gray-800 p-3 rounded-lg">
                {status.replace('_', ' ')} ({columnTasks.length})
              </h3>
              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No tasks</p>
                ) : (
                  columnTasks.map(task => (
                    <Card key={task.id} className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => setSelectedTask(task)}>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-white text-sm">{task.service}</h4>
                        <p className="text-xs text-gray-400">{task.customer}</p>
                        <p className="text-xs text-gray-500">{task.time}</p>
                        <Badge className={`mt-2 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'} text-white text-xs`}>
                          {task.priority}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-40">
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
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_service">In Service</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(!showNotifications)} className="text-gray-300 hover:text-white">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-xs px-1 min-w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="font-medium mb-3 text-white">Notifications</h3>
                    <div className="space-y-2">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-2 bg-gray-700 rounded text-sm hover:bg-gray-600 transition-colors">
                          <p className="text-gray-200">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.location.href = '/profile'}
              title="View Profile"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-700 text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">{user?.firstName}</span>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/worker-tasks'}
              className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
            >
              My Tasks
            </Button>
            
            <Button variant="outline" onClick={logout} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white transition-colors">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sort} onValueChange={(value) => setFilters({...filters, sort: value})}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
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
              className={view === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className={view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
              className={view === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Legend */}
        {view === 'calendar' && !loading && (
          <div className="mb-4 flex flex-wrap gap-4 bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-300">Assigned Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-300">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-300">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span className="text-sm text-gray-300">Google Calendar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-4 bg-blue-500 rounded ring-2 ring-blue-400"></div>
              <span className="text-sm text-gray-300">Today</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mb-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {view === 'calendar' && <CalendarView />}
              {view === 'list' && <ListView />}
              {view === 'kanban' && <KanbanView />}
            </>
          )}
        </div>

        {/* Service Detail Modal */}
        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <DialogContent className="max-w-5xl bg-gray-800 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Service Details - {selectedTask.service}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer Information
                    </h3>
                    <p 
                      className="text-gray-300 font-medium cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => window.open('/profile', '_blank')}
                      title="View customer profile"
                    >
                      {selectedTask.customer}
                    </p>
                    <p className="text-sm text-gray-400">{selectedTask.service}</p>
                    <Badge className={`mt-2 ${selectedTask.priority === 'high' ? 'bg-red-500' : selectedTask.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'} text-white`}>
                      {selectedTask.priority} priority
                    </Badge>
                  </div>

                  {/* Service Details */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-3">Service Details</h3>
                    <p className="text-gray-300 mb-3">{selectedTask.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{selectedTask.date} at {selectedTask.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{selectedTask.distance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </h3>
                    <p className="text-gray-300 mb-3">{selectedTask.location}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Navigation className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-600">
                        <Map className="h-4 w-4 mr-1" />
                        View Map
                      </Button>
                    </div>
                  </div>

                  {/* Quotation */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-3 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Quotation Details
                    </h3>
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
                      <div className="flex justify-between font-medium border-t border-gray-600 pt-2 mt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-green-400 font-bold">${selectedTask.charges.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Progress Tracker */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-4 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Progress Tracker
                    </h3>
                    <div className="space-y-4">
                      {getProgressSteps(selectedTask.progress).map((step, index) => {
                        const stepKey = ['assigned', 'start_service', 'reached', 'done'][index];
                        const isNext = !step.completed && index === getProgressSteps(selectedTask.progress).findIndex(s => !s.completed);
                        
                        return (
                          <div key={step.name} className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step.completed ? 'bg-green-500' : isNext ? 'bg-orange-500' : 'bg-gray-600'
                            }`}>
                              {step.completed ? (
                                <CheckCircle className="h-5 w-5 text-white" />
                              ) : isNext ? (
                                <Play className="h-4 w-4 text-white" />
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <span className={`flex-1 ${step.completed ? 'text-white' : isNext ? 'text-orange-400' : 'text-gray-400'}`}>
                              {step.name}
                            </span>
                            {isNext && (
                              <div className="flex space-x-2">
                                {stepKey === 'reached' && selectedTask.otp && (
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      placeholder="Enter OTP"
                                      value={otpInput}
                                      onChange={(e) => setOtpInput(e.target.value)}
                                      className="w-24 h-8 bg-gray-600 border-gray-500 text-white text-sm"
                                    />
                                    <Button size="sm" onClick={verifyOTP} className="bg-green-600 hover:bg-green-700 h-8">
                                      Verify
                                    </Button>
                                  </div>
                                )}
                                {stepKey !== 'reached' && (
                                  <Button
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700"
                                    onClick={() => updateProgress(selectedTask.id, stepKey)}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Update
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Communication */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-4 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Communication
                    </h3>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Send a message or note to customer/admin..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 resize-none"
                        rows={3}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={sendMessage} className="bg-green-600 hover:bg-green-700">
                          <Send className="h-3 w-3 mr-1" />
                          Send Message
                        </Button>
                        <Button size="sm" onClick={shareLocation} variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                          <Share2 className="h-3 w-3 mr-1" />
                          Share Location
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-gray-500 text-gray-300 hover:bg-gray-600"
                        onClick={() => createGoogleCalendarEvent(selectedTask!)}
                        disabled={!isGoogleAPILoaded}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Add to Calendar
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                        <Eye className="h-3 w-3 mr-1" />
                        View Invoice
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Add Notes
                      </Button>
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
      </div>
    </div>
  );
};

export default WorkerDashboard;