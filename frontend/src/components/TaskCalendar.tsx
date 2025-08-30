import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  clientName: string;
  serviceType: string;
  scheduledTime: string;
  status: string;
  priority: string;
}

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const statusColors = {
  assigned: 'bg-blue-500',
  start_service: 'bg-yellow-500',
  reached: 'bg-orange-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  done: 'bg-gray-500'
};

export function TaskCalendar({ tasks, onTaskClick }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledTime);
      return taskDate.toDateString() === targetDate.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDate(day);
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    
    days.push(
      <div 
        key={day} 
        className={`h-24 p-1 border border-border rounded-lg ${
          isToday ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
            {day}
          </span>
          {dayTasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {dayTasks.length}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1 overflow-hidden">
          {dayTasks.slice(0, 2).map(task => (
            <div
              key={task._id}
              className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 text-white ${
                statusColors[task.status as keyof typeof statusColors]
              }`}
              onClick={() => onTaskClick(task._id)}
            >
              <div className="truncate font-medium">{task.title}</div>
              <div className="flex items-center gap-1 opacity-90">
                <Clock className="h-2 w-2" />
                <span>{new Date(task.scheduledTime).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          ))}
          {dayTasks.length > 2 && (
            <div className="text-xs text-muted-foreground text-center">
              +{dayTasks.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{monthYear}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </CardContent>
    </Card>
  );
}