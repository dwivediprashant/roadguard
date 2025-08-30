import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  requestId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.id) {
      console.log('NotificationContext: Initializing for user', user.id, user.userType);
      
      // Initialize socket connection
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);

      // Join user room
      newSocket.emit('join', user.id);
      console.log('NotificationContext: Joined room for user', user.id);

      // Listen for new notifications
      newSocket.on('new_notification', (notification) => {
        console.log('NotificationContext: Received notification', notification);
        setNotifications(prev => {
          const updated = [notification, ...prev];
          console.log('NotificationContext: Updated notifications count', updated.length);
          return updated;
        });
        
        // Show toast notification for admins
        if (user.userType === 'admin') {
          console.log('NotificationContext: Showing toast for admin');
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      });
      
      // Listen for room join confirmation
      newSocket.on('joined_room', (data) => {
        console.log('NotificationContext: Joined room confirmation', data);
      });
      
      // Listen for debug notifications
      newSocket.on('debug_notification', (data) => {
        console.log('NotificationContext: Debug notification', data);
      });

      // Fetch existing notifications
      fetchNotifications();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    console.log('NotificationContext: Fetching notifications for user', user.id);
    
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('NotificationContext: Fetch response status', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('NotificationContext: Fetched notifications', data);
        setNotifications(data);
      } else {
        console.error('NotificationContext: Failed to fetch notifications', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};