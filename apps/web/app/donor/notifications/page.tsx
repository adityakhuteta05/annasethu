'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Award,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';

export default function DonorNotificationsPage() {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/donor/notifications');
        if (res.ok) {
          setNotifications(await res.json());
        }
      } catch (e) {
        // Fallback
      }
    }
    loadNotifs();
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await fetch(`http://localhost:8000/api/v1/donor/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch (e) {
      // Optimistic state remains
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MATCH':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'DRIVER':
        return <Truck className="w-4 h-4 text-[#e0662b]" />;
      case 'URGENT':
        return <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />;
      case 'ACHIEVEMENT':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-900" />;
    }
  };

  const filtered = notifications.filter(
    (n) => filterCategory === 'ALL' || n.category === filterCategory
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notification & Dispatch Log
          </h1>
          <p className="text-xs text-slate-500">
            Real-time logistical milestones, driver arrivals, and mission deadline warnings
          </p>
        </div>

        <button
          onClick={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
          }
          className="text-xs font-bold text-slate-900 dark:text-[#4f9d3a] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'MATCH', 'DRIVER', 'URGENT', 'ACHIEVEMENT'].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterCategory === c
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-white border border-slate-200 border-slate-200 text-slate-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              item.is_read
                ? 'bg-white/80 bg-white/60 border-slate-200 border-slate-200 opacity-80'
                : 'bg-white border-[#1f4d36] dark:border-emerald-700 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.title}
                  </span>
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#e0662b]" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.message}
                </p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.action_url && (
                <a
                  href={item.action_url}
                  className="px-3 py-1 rounded-lg border border-[#1f4d36] text-slate-900 dark:text-[#4f9d3a] hover:bg-emerald-600 hover:text-white text-xs font-semibold flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              )}
              {!item.is_read && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
