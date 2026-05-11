'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Bell,
  Dumbbell,
  Flame,
  AlertTriangle,
  Brain,
  PieChart,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types';

const TYPE_META: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  workout_reminder:    { icon: Dumbbell,      color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  streak_warning:      { icon: Flame,         color: 'text-orange-500', bg: 'bg-orange-500/10' },
  overspending_alert:  { icon: AlertTriangle, color: 'text-rose-500',   bg: 'bg-rose-500/10' },
  daily_checkin:       { icon: CheckCircle2,  color: 'text-teal-500',   bg: 'bg-teal-500/10' },
  weekly_report:       { icon: PieChart,      color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ai_insight:          { icon: Brain,         color: 'text-teal-500',   bg: 'bg-teal-500/10' },
  budget_alert:        { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  habit_reminder:      { icon: Sparkles,      color: 'text-green-500',  bg: 'bg-green-500/10' },
  system:              { icon: Info,          color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function NotificationsContent({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Notifications</h1>
        </div>
        <div className="aethlife-card text-center py-16">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No notifications yet</p>
          <p className="text-xs text-muted-foreground">
            AethLife will notify you about streaks, budget alerts, AI insights, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">{notifications.length} total</p>
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => {
          const meta = TYPE_META[notif.type] ?? TYPE_META.system;
          const Icon = meta.icon;

          return (
            <div
              key={notif.id}
              className={`aethlife-card flex items-start gap-4 ${!notif.is_read ? 'bg-teal-500/[0.03] border-teal-500/20' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  {formatDistanceToNow(parseISO(notif.sent_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
