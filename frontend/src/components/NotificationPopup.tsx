import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationPopupProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const NotificationPopup = ({ notifications, onClose }: NotificationPopupProps) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
    
    // Auto-close notifications
    notifications.forEach(notification => {
      if (notification.autoClose !== false) {
        setTimeout(() => {
          onClose(notification.id);
        }, notification.duration || 5000);
      }
    });
  }, [notifications, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-orange-500';
      default: return 'border-l-blue-500';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`bg-gray-800 border-gray-700 border-l-4 ${getBorderColor(notification.type)} shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                {notification.action && notification.actionLabel && (
                  <Button
                    size="sm"
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                    onClick={notification.action}
                  >
                    {notification.actionLabel}
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => onClose(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationPopup;