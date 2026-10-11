'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  pair?: string;
  signal?: 'BUY' | 'SELL' | 'HOLD';
  confidence?: number;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  latestNotification: Notification | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  
  // 🆕 Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialLoadDone = useRef(false);

  // 🆕 Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  const playSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.log('Sound blocked by browser (user interaction needed):', err);
        });
      }
    } catch (error) {
      console.error('Sound play error:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=20');
      const data = await res.json();

      if (data.success) {
        const newNotifications = data.notifications;

        // 🆕 Check for new unread notification (only after initial load)
        if (initialLoadDone.current && notifications.length > 0 && newNotifications.length > 0) {
          const latest = newNotifications[0];
          const previousLatest = notifications[0];

          // Agar naya notification aaya hai (different ID) aur unread hai
          if (latest._id !== previousLatest._id && !latest.isRead) {
            setLatestNotification(latest);
            playSound(); // 🔔 Play sound
          }
        }

        // Mark initial load done
        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
        }

        setNotifications(newNotifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark read failed:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all read failed:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refresh: fetchNotifications,
        markAsRead,
        markAllAsRead,
        latestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}