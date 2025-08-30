import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  available: { color: 'bg-green-500', label: 'Available', textColor: 'text-green-700' },
  in_service: { color: 'bg-yellow-500', label: 'In Service', textColor: 'text-yellow-700' },
  not_available: { color: 'bg-red-500', label: 'Not Available', textColor: 'text-red-700' },
  assigned: { color: 'bg-blue-500', label: 'Assigned', textColor: 'text-blue-700' },
  start_service: { color: 'bg-yellow-500', label: 'Started', textColor: 'text-yellow-700' },
  reached: { color: 'bg-orange-500', label: 'Reached', textColor: 'text-orange-700' },
  in_progress: { color: 'bg-purple-500', label: 'In Progress', textColor: 'text-purple-700' },
  completed: { color: 'bg-green-500', label: 'Completed', textColor: 'text-green-700' },
  done: { color: 'bg-gray-500', label: 'Done', textColor: 'text-gray-700' }
};

export function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned;
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-full ${config.color} ${sizeClasses[size]}`}></div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}