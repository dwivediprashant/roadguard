import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, User, Wrench } from "lucide-react";

interface RequestWorkflowStatusProps {
  status: 'pending' | 'admin-reviewing' | 'worker-assigned' | 'in-progress' | 'completed' | 'done';
  assignedWorker?: string;
}

const RequestWorkflowStatus = ({ status, assignedWorker }: RequestWorkflowStatusProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Pending Admin Review',
          description: 'Your request is waiting for admin to assign a worker',
          color: 'secondary' as const
        };
      case 'admin-reviewing':
        return {
          icon: <User className="h-4 w-4" />,
          label: 'Admin Reviewing',
          description: 'Admin is selecting the best worker for your service',
          color: 'outline' as const
        };
      case 'worker-assigned':
        return {
          icon: <Wrench className="h-4 w-4" />,
          label: 'Worker Assigned',
          description: `${assignedWorker || 'A worker'} has been assigned to your request`,
          color: 'default' as const
        };
      case 'in-progress':
        return {
          icon: <Wrench className="h-4 w-4" />,
          label: 'Service In Progress',
          description: 'Your service is currently being performed',
          color: 'default' as const
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Service Completed',
          description: 'Your service has been completed successfully',
          color: 'outline' as const
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Processing',
          description: 'Your request is being processed',
          color: 'secondary' as const
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center gap-3">
      <Badge variant={statusInfo.color} className="flex items-center gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
      <span className="text-sm text-muted-foreground">{statusInfo.description}</span>
    </div>
  );
};

export default RequestWorkflowStatus;