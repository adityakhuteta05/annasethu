'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  IndianRupee,
  Award,
  Flame,
  ChevronRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-drv-01',
    category: 'URGENT',
    title: '🚨 Urgent Rescue Offer Nearby (2.1 km)',
    message: 'New urgent 24 kg meal rescue near Barakhamba Road. ₹370 fare. Expiry window closes in 41 mins.',
    created_at: '5 minutes ago',
    is_read: false,
    action_url: '/driver/jobs/JOB-AN-1024'
  },
  {
    id: 'notif-drv-02',
    category: 'PAYMENT',
    title: 'Delivery Fare Settled (+₹370)',
    message: '₹370 credited to wallet for verified Rescue Delivery #DEL-2026-000 to Seva Bharti.',
    created_at: '3 hours ago',
    is_read: true,
    action_url: '/driver/earnings'
  },
  {
    id: 'notif-drv-03',
    category: 'ACHIEVEMENT',
    title: '50 Deliveries Milestone Unlocked! 🏆',
    message: 'You have completed 50 verified on-time food rescue missions! Badge unlocked.',
    created_at: 'Yesterday',
    is_read: true,
    action_url: '/driver/achievements'
  },
  {
    id: 'notif-drv-04',
    category: 'COMPLIANCE',
    title: 'Vehicle Fitness Current',
    message: 'Van DL-1V-AC-8412 fitness certificate confirmed valid through August 2027.',
    created_at: '3 days ago',
    is_read: true,
    action_url: '/driver/vehicles'
  }
];

export default function DriverNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/driver/notifications');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((d: any) => ({
              id: d.id,
              category: d.category || 'GENERAL',
              title: d.title,
              message: d.message,
              created_at: 'Just now',
              is_read: !!d.is_read,
              action_url: d.action_url || '/driver/dashboard'
            }));
            setNotifications(prev => {
              const merged = [...mapped];
              for (const p of prev) {
                if (!merged.some(m => m.id === p.id)) merged.push(p);
              }
              return merged;
            });
          }
        }
      } catch {
        // fallback
      }
    }
    loadNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? { ...item, is_read: true } : item))
    );
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const categories = [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'URGENT', label: 'Urgent Jobs' },
    { id: 'PAYMENT', label: 'Earnings' },
    { id: 'ACHIEVEMENT', label: 'Milestones' }
  ];

  const filtered = notifications.filter(n => {
    if (filterCategory === 'ALL') return true;
    return n.category === filterCategory;
  });

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'URGENT':
        return <Flame className="w-5 h-5 text-rose-600" />;
      case 'PAYMENT':
        return <IndianRupee className="w-5 h-5 text-emerald-600" />;
      case 'ACHIEVEMENT':
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
              Partner Alerts
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-600" />
            Dispatch & Mission Alerts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time notifications for nearby surplus job opportunities, settlements, and achievements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-stone-500" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterCategory === c.id
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#1c2024] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-1">
            <Bell className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">No notifications found</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className={`p-5 transition flex items-start gap-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 ${
                !item.is_read ? 'bg-orange-50/15 dark:bg-orange-950/10' : ''
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 shrink-0 mt-0.5">
                {getIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm ${
                      !item.is_read
                        ? 'font-black text-stone-900 dark:text-white'
                        : 'font-semibold text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-stone-400">{item.created_at}</span>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-orange-600" title="Unread" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.message}</p>

                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={item.action_url}
                    onClick={() => markAsRead(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    View Action
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="text-xs text-stone-400 hover:text-stone-700"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
