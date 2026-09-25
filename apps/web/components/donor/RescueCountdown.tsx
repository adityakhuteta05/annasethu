'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RescueCountdownProps {
  initialSeconds?: number;
  deadlineIso?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RescueCountdown({
  initialSeconds,
  deadlineIso,
  className = '',
  size = 'md',
}: RescueCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (initialSeconds !== undefined) return initialSeconds;
    if (deadlineIso) {
      const diff = Math.max(0, Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000));
      return diff;
    }
    return 3600;
  });

  useEffect(() => {
    if (deadlineIso) {
      const interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000));
        setSecondsRemaining(diff);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [deadlineIso]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = secondsRemaining < 1800; // <30m
  const isUrgent = secondsRemaining < 3600; // <1h

  const sizeClasses = {
    sm: 'text-xs font-mono font-bold tracking-tight',
    md: 'text-sm sm:text-base font-mono font-bold tracking-wider',
    lg: 'text-2xl sm:text-3xl font-mono font-black tracking-widest',
  };

  const colorClass = isCritical
    ? 'text-rose-600 dark:text-rose-400'
    : isUrgent
    ? 'text-[#e0662b] dark:text-[#ff8a50]'
    : 'text-slate-900 dark:text-[#4f9d3a]';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Clock className={`w-4 h-4 ${colorClass} ${isUrgent ? 'animate-pulse' : ''}`} />
      <span className={`${sizeClasses[size]} ${colorClass}`}>
        {formatted}
      </span>
    </div>
  );
}
