'use client'

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setUnreadCount(data.data.filter((n: any) => !n.read).length);
          }
        })
        .catch(e => console.error("Failed to fetch notifications:", e));
    };

    fetchUnread();
    
    // Refresh count every 10 seconds to sync with manual read actions on other pages
    const interval = setInterval(fetchUnread, 10000);

    const eventSource = new EventSource('/api/notifications/stream');
    eventSource.onmessage = (event) => {
      // Re-fetch immediately to get accurate count and data
      fetchUnread();
      
      // Optional: Logic for specific types
      try {
        const newNotif = JSON.parse(event.data);
        if (newNotif.type === 'exam') {
          const dot = document.getElementById('exam-live-dot');
          if (dot) dot.classList.remove('hidden');
        }
      } catch(e) {}
    };

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  return (
    <Link 
      href="/student/notifications"
      className="relative p-2 text-gray-500 hover:text-indigo-600 transition"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
