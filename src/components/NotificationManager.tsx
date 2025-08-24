import React, { useState, useCallback } from 'react';
import NotificationToast, { NotificationProps } from './NotificationToast';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationManagerProps {
  children: React.ReactNode;
}

export const NotificationContext = React.createContext<{
  showNotification: (notification: Omit<NotificationData, 'id'>) => void;
}>({
  showNotification: () => {}
});

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<NotificationManagerProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      ...notification,
      id
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000, pointerEvents: 'none' }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              position: 'absolute',
              top: `${20 + index * 100}px`,
              right: '20px',
              pointerEvents: 'auto'
            }}
          >
            <NotificationToast
              {...notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
