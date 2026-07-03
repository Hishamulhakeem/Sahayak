'use client';

import { Navigation } from '@/components/navigation'
import { Bell, BookOpen, AlertCircle, MessageSquare, ArrowLeft, Check, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { NotificationBell } from '@/components/notification-bell'
import { useEffect, useState } from 'react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    const eventSource = new EventSource('/api/notifications/stream');
    eventSource.onmessage = (event) => {
      const newNotif = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }) 
      });
      
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'exam':
      case 'assignment':
        return <AlertCircle className="w-6 h-6" />;
      case 'note':
      case 'materials':
        return <BookOpen className="w-6 h-6" />;
      default:
        return <MessageSquare className="w-6 h-6" />;
    }
  };

  const getColorClass = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50 border-gray-200 opacity-70';
    switch (type) {
      case 'exam':
      case 'assignment':
        return 'bg-white border-red-100';
      case 'note':
      case 'materials':
        return 'bg-white border-purple-100';
      default:
        return 'bg-white border-blue-100';
    }
  };

  const getIconBgClass = (type: string) => {
    switch (type) {
      case 'exam':
      case 'assignment':
        return 'bg-red-50 text-red-500';
      case 'note':
      case 'materials':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/student/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <NotificationBell /> Notifications
          </h1>
          {notifications.some(n => !n.read) && (
            <button 
              onClick={() => markAsRead('all')}
              className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl border border-gray-200">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={`p-6 rounded-2xl shadow-sm border flex items-start space-x-4 transition-all ${
                  getColorClass(notif.type, notif.read)
                } ${!notif.read ? 'cursor-pointer hover:shadow-md' : ''}`}
              >
                <div className={`${getIconBgClass(notif.type)} p-3 rounded-full flex-shrink-0 mt-1`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{notif.title}</h3>
                  <p className="text-gray-600 mt-1">{notif.message}</p>
                  <span className="text-xs font-semibold text-gray-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                {!notif.read && (
                  <div className="w-3 h-3 bg-purple-600 rounded-full flex-shrink-0 mt-3"></div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
