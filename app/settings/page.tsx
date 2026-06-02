'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Bell, Shield, Palette, Moon, Sun, Loader2, CheckCircle2, LogOut, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { CURRENCY_NAMES } from '@/lib/pricing';
import type { Currency, NotificationPreferences } from '@/types';

export const dynamic = 'force-dynamic';


const profileSchema = z.object({
  full_name: z.string().min(2).max(80),
  timezone: z.string(),
  currency: z.enum(['NGN', 'USD', 'EUR', 'GBP']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const TIMEZONES = [
  'Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
];

const CURRENCY_OPTIONS: Currency[] = ['NGN', 'USD', 'EUR', 'GBP'];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    workout_reminders: true,
    workout_reminder_time: '08:00',
    streak_warnings: true,
    overspending_alerts: true,
    daily_checkins: true,
    daily_checkin_time: '09:00',
    weekly_reports: true,
    ai_insights: true,
    email_notifications: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsLoading(false); return; }

        const [{ data: profile }, { data: onboarding }] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).single(),
          supabase.from('onboarding_preferences').select('notification_preferences').eq('user_id', user.id).single(),
        ]);

        if (profile) {
          reset({ full_name: profile.full_name ?? '', timezone: profile.timezone ?? 'Africa/Lagos', currency: (profile.currency ?? 'NGN') as Currency });
        }
        if (onboarding?.notification_preferences) {
          setNotifPrefs(onboarding.notification_preferences as NotificationPreferences);
        }
      } catch (err) {
        console.error('[AethLife] Settings load error:', err);
        toast.error('Could not load settings. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function onProfileSubmit(data: ProfileFormData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: data.full_name, timezone: data.timezone, currency: data.currency })
      .eq('user_id', user.id);

    if (error) { toast.error('Failed to update profile'); return; }
    toast.success('Profile updated!');
  }

  async function saveNotifPrefs(prefs: NotificationPreferences) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('onboarding_preferences')
      .update({ notification_preferences: prefs })
      .eq('user_id', user.id);

    if (error) { toast.error('Failed to save notification preferences'); return; }
    toast.success('Notification preferences saved');
  }

  function updateNotifPref<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    saveNotifPrefs(updated);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-xl animate-pulse">
        <div className="h-7 bg-muted rounded-xl w-32" />
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl border border-border p-5 space-y-3">
            <div className="h-5 bg-muted rounded-lg w-40" />
            <div className="h-10 bg-muted rounded-xl" />
            <div className="h-10 bg-muted rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 max-w-xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile, preferences, and account.</p>
      </div>

      {/* Profile */}
      <div className="aethlife-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-teal-500" />
          <p className="text-sm font-semibold text-foreground">Profile</p>
        </div>
        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full name</label>
            <input
              {...register('full_name')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Currency</label>
              <select
                {...register('currency')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{CURRENCY_NAMES[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Timezone</label>
              <select
                {...register('timezone')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="aethlife-card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-teal-500" />
          <p className="text-sm font-semibold text-foreground">Appearance</p>
        </div>
        <div className="flex items-center bg-muted rounded-xl p-1">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Shield },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                theme === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="aethlife-card">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-teal-500" />
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        <div className="space-y-3.5">
          {[
            { key: 'workout_reminders', label: 'Workout reminders', description: 'Daily reminders to log your workouts' },
            { key: 'streak_warnings', label: 'Streak warnings', description: 'Alert before breaking a habit streak' },
            { key: 'overspending_alerts', label: 'Overspending alerts', description: 'Notify when approaching budget limits' },
            { key: 'daily_checkins', label: 'Daily check-ins', description: 'Morning nudge to log your day' },
            { key: 'weekly_reports', label: 'Weekly reports', description: 'Summary of your week every Monday' },
            { key: 'ai_insights', label: 'AI insights', description: 'Get notified when new insights are ready' },
            { key: 'email_notifications', label: 'Email notifications', description: 'Receive important updates by email' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <button
                role="switch"
                aria-checked={notifPrefs[key as keyof NotificationPreferences] as boolean}
                onClick={() => updateNotifPref(key as keyof NotificationPreferences, !notifPrefs[key as keyof NotificationPreferences] as any)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
                  notifPrefs[key as keyof NotificationPreferences] ? 'bg-teal-500' : 'bg-muted-foreground/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifPrefs[key as keyof NotificationPreferences] ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div className="aethlife-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-teal-500" />
          <p className="text-sm font-semibold text-foreground">Account</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted text-foreground text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            Sign out
          </button>
          <button
            onClick={() => toast.error('Account deletion requires contacting support at info@aethlife.vercel.app')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/30 hover:bg-destructive/5 text-destructive text-sm font-medium transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
