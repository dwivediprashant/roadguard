import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketRef.current = io('http://localhost:3001');
      
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        socketRef.current?.emit('join', user.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  return socketRef.current;
};