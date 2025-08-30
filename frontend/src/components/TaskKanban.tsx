import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  clientName: string;
  serviceType: string;
  location: { address: string };
  scheduledTime: string;
  status: string;
  priority: string;
  upvotes: number;
}

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const statusColumns = [
  { key: 'assigned', label: 'Assigned', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'start_service', label: 'Started', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { key: 'reached', label: 'Reached', color: 'bg-orange-50 dark:bg-orange-900/20' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { key: 'completed', label: 'Completed', color: 'bg-green-50 dark:bg-green-900/20' }
];

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400'
};

export function TaskKanban({ tasks, onTaskClick }: TaskKanbanProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-[600px]">
      {statusColumns.map(column => {
        const columnTasks = tasks.filter(task => task.status === column.key);
        
        return (
          <div key={column.key} className={`rounded-lg p-4 ${column.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column.label}</h3>
              <Badge variant="secondary">{columnTasks.length}</Badge>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[500px]">
              {columnTasks.map(task => (
                <Card 
                  key={task._id}
                  className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
                    priorityColors[task.priority as keyof typeof priorityColors]
                  }`}
                  onClick={() => onTaskClick(task._id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {task.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate">{task.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{task.location.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(task.scheduledTime)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.serviceType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ↑ {task.upvotes}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}