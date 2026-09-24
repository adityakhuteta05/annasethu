'use client';

import React from 'react';

export type UrgencyLevel = 'SAFE' | 'WARNING' | 'URGENT' | 'CRITICAL';

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  className?: string;
  showIcon?: boolean;
}

export function UrgencyBadge({ level, className = '', showIcon = true }: UrgencyBadgeProps) {
  const configs: Record<UrgencyLevel, { bg: string; text: string; border: string; dot: string; label: string }> = {
    SAFE: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      label: 'Safe Window',
    },
    WARNING: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      label: 'Moderate Urgency',
    },
    URGENT: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      dot: 'bg-orange-500 animate-pulse',
      label: 'Urgent Rescue',
    },
    CRITICAL: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-800 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-600 animate-ping',
      label: 'Critical Deadline',
    },
  };

  const current = configs[level] || configs.SAFE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
      {current.label}
    </span>
  );
}
