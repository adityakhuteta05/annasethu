'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  ChevronRight,
  Filter,
  CheckCheck,
  Flame,
  FileText
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
    id: 'notif-ngo-001',
    category: 'HIGH_PRIORITY_FOOD',
    title: '🚨 High Priority Rescue Available',
    message: '24 kg prepared vegetarian meals available from The Grand Palace Hotel. 3.1 km away. Expiry window closes in 55 mins.',
    created_at: '10 minutes ago',
    is_read: false,
    action_url: '/ngo/available-food'
  },
  {
    id: 'notif-ngo-002',
    category: 'DRIVER_ASSIGNED',
    title: '🚚 Driver Assigned to Delivery #DEL-2026-001',
    message: 'Delivery partner Rahul Sharma (Van DL-1VC-8902) accepted your rescue run. Estimated arrival at shelter: 22 mins.',
    created_at: '25 minutes ago',
    is_read: false,
    action_url: '/ngo/deliveries/DEL-2026-001'
  },
  {
    id: 'notif-ngo-003',
    category: 'RESERVATION',
    title: 'Reservation Confirmed (20 kg)',
    message: 'Allocation #RES-8921 confirmed for Dinner Service. Logistics fare of ₹370 held from institutional wallet.',
    created_at: '1 hour ago',
    is_read: true,
    action_url: '/ngo/reservations'
  },
  {
    id: 'notif-ngo-004',
    category: 'PICKUP',
    title: 'Food Picked Up by Driver',
    message: 'Driver verified package seal #SEAL-9921 at donor dock. Temperature verified at 68°C. In transit.',
    created_at: '2 hours ago',
    is_read: true,
    action_url: '/ngo/deliveries/DEL-2026-001'
  },
  {
    id: 'notif-ngo-005',
    category: 'PAYMENT',
    title: 'Logistics Settlement Completed',
    message: 'Delivery #DEL-2026-000 completed. ₹340 deducted from wallet. Transparent breakdown available in ledger.',
    created_at: 'Yesterday',
    is_read: true,
    action_url: '/ngo/wallet'
  },
  {
    id: 'notif-ngo-006',
    category: 'VERIFICATION',
    title: 'NGO-DARPAN Annual Status Verified',
    message: 'Public trust registry DL/2021/0284912 confirmed active. Section 80G validity active through March 2027.',
    created_at: '3 days ago',
    is_read: true,
    action_url: '/ngo/verification'
  }
];

export default function NGONotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/ngo/notifications');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // map API notifications
            const mapped = data.map((item: any) => ({
              id: item.id,
              category: item.category || 'GENERAL',
              title: item.title,
              message: item.message,
              created_at: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              is_read: !!item.is_read,
              action_url: item.action_url?.replace('/receiver/', '/ngo/') || '/ngo/dashboard'
            }));
            setNotifications(prev => {
              const combined = [...mapped];
              // merge unique
              for (const p of prev) {
                if (!combined.some(c => c.id === p.id)) {
                  combined.push(p);
                }
              }
              return combined;
            });
          }
        }
      } catch {
        // use initial
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
    { id: 'HIGH_PRIORITY_FOOD', label: 'Urgent Rescues' },
    { id: 'DRIVER_ASSIGNED', label: 'Drivers' },
    { id: 'RESERVATION', label: 'Reservations' },
    { id: 'PAYMENT', label: 'Finance' },
    { id: 'VERIFICATION', label: 'Compliance' }
  ];

  const filtered = notifications.filter(item => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter || (activeFilter === 'DRIVER_ASSIGNED' && (item.category === 'DRIVER' || item.category === 'PICKUP' || item.category === 'DELIVERY'));
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HIGH_PRIORITY_FOOD':
      case 'URGENT':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'DRIVER_ASSIGNED':
      case 'DRIVER':
      case 'PICKUP':
      case 'DELIVERY':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'RESERVATION':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'PAYMENT':
        return <DollarSign className="w-5 h-5 text-stone-600" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Operations Center
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            Dispatch & Handoff Notifications
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Live updates on matched food surplus, driver en-route coordinates, and custody verification handoffs.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
          >
            <CheckCheck className="w-4 h-4 text-stone-600" />
            Mark all read
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === cat.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Bell className="w-10 h-10 mx-auto text-stone-300 mb-3" />
            <p className="font-semibold text-stone-800">No alerts found</p>
            <p className="text-xs text-stone-500 mt-1">No alerts match the selected filter category.</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className={`p-5 transition flex items-start gap-4 hover:bg-stone-50/80 ${
                !item.is_read ? 'bg-emerald-50/20' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 shrink-0 mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm ${
                      !item.is_read ? 'font-bold text-stone-950' : 'font-semibold text-stone-800'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.created_at}
                    </span>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" title="Unread" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.message}</p>

                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={item.action_url}
                    onClick={() => markAsRead(item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="text-xs font-medium text-stone-500 hover:text-stone-800"
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
