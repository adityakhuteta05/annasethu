'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  milestone_target: number;
  current_progress: number;
  unlocked: boolean;
  unlocked_date: string | null;
  badge_icon: string;
}

export default function DriverAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'ACH-DELIV-50',
      title: '50 Rescues Completed',
      description: 'Transported verified surplus food across 50 successful missions.',
      milestone_target: 50,
      current_progress: 52,
      unlocked: true,
      unlocked_date: '2026-09-23',
      badge_icon: '🏆'
    },
    {
      id: 'ACH-DELIV-100',
      title: '100 Rescue Deliveries',
      description: 'Century Club: Complete 100 on-time verified food rescue missions.',
      milestone_target: 100,
      current_progress: 52,
      unlocked: false,
      unlocked_date: null,
      badge_icon: '🎖'
    },
    {
      id: 'ACH-DELIV-250',
      title: '250 Rescues Milestone',
      description: 'Quarter-Thousand Rescues: Saved over 3,000 kg of edible community food.',
      milestone_target: 250,
      current_progress: 52,
      unlocked: false,
      unlocked_date: null,
      badge_icon: '🌟'
    },
    {
      id: 'ACH-HOURS-50',
      title: '50 Rescue Duty Hours',
      description: 'Dedicated over 50 verified operational hours to rapid food rescue.',
      milestone_target: 50,
      current_progress: 37.5,
      unlocked: false,
      unlocked_date: null,
      badge_icon: '⏱'
    },
    {
      id: 'ACH-HOURS-100',
      title: '100 Duty Hours',
      description: 'Logged 100 operational hours on active rapid response rescue transit.',
      milestone_target: 100,
      current_progress: 37.5,
      unlocked: false,
      unlocked_date: null,
      badge_icon: '🛡'
    },
    {
      id: 'ACH-ZERO-SPOIL',
      title: 'Zero Spoilage Champion',
      description: 'Delivered 25 consecutive rescue missions within safe temperature windows.',
      milestone_target: 25,
      current_progress: 25,
      unlocked: true,
      unlocked_date: '2026-09-20',
      badge_icon: '🌿'
    }
  ]);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/driver/achievements');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAchievements(data);
          }
        }
      } catch {
        // fallback
      }
    }
    loadAchievements();
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Driver Recognition
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {unlockedCount} of {achievements.length} Badges Unlocked
            </span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            Verified Rescue Milestones
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Milestones are automatically unlocked based on verified GPS delivery handoffs.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 rounded-2xl">
          <Trophy className="w-8 h-8 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-950 dark:text-amber-200 block">Senior Rescue Partner</span>
            <span className="text-stone-500 text-[11px]">Ranked Top 5% in Delhi NCR</span>
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map(ach => {
          const progressPercent = Math.min(
            100,
            Math.round((ach.current_progress / ach.milestone_target) * 100)
          );

          return (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border transition space-y-4 ${
                ach.unlocked
                  ? 'bg-white dark:bg-[#1c2024] border-amber-300 dark:border-amber-800/80 shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                      ach.unlocked
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                    }`}
                  >
                    {ach.badge_icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                      {ach.title}
                    </h3>
                    <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {ach.unlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 shrink-0">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium">Progress</span>
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    {ach.current_progress} / {ach.milestone_target} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-amber-500' : 'bg-stone-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {ach.unlocked && ach.unlocked_date && (
                  <span className="text-[10px] text-stone-400 block pt-0.5">
                    Achieved on {ach.unlocked_date}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
