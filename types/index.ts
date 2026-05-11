// ============================================================
// AethLife - Complete Type Definitions
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================================
// Auth & User
// ============================================================
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  currency: Currency;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  onboarding_completed: boolean;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingPreferences {
  id: string;
  user_id: string;
  goals: string[];
  join_reason: string;
  fitness_goals: string[];
  budget_goals: string[];
  notification_preferences: NotificationPreferences;
  completed_steps: string[];
  completed_at: string | null;
  created_at: string;
}

export type Currency = 'USD' | 'NGN' | 'EUR' | 'GBP';
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

// ============================================================
// Fitness & Workout
// ============================================================
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  duration_minutes: number | null;
  completed_at: string;
  is_template: boolean;
  template_id: string | null;
  created_at: string;
  updated_at: string;
  workout_logs?: WorkoutLog[];
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: EquipmentType;
  description: string | null;
  is_custom: boolean;
  user_id: string | null;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  notes: string | null;
  created_at: string;
  exercise?: Exercise;
}

export interface StepLog {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  distance_km: number | null;
  calories_burned: number | null;
  created_at: string;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body'
  | 'other';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cables'
  | 'bodyweight'
  | 'resistance_band'
  | 'kettlebell'
  | 'other';

// ============================================================
// Expenses & Budget
// ============================================================
export interface ExpenseCategory {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency: Currency;
  description: string;
  merchant: string | null;
  date: string;
  is_recurring: boolean;
  recurring_expense_id: string | null;
  receipt_url: string | null;
  receipt_data: ReceiptData | null;
  ai_scanned: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency: Currency;
  description: string;
  merchant: string | null;
  frequency: RecurringFrequency;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_income: number;
  currency: Currency;
  savings_goal_percent: number;
  created_at: string;
  updated_at: string;
  category_limits?: BudgetCategoryLimit[];
}

export interface BudgetCategoryLimit {
  id: string;
  budget_id: string;
  category_id: string;
  limit_amount: number;
  created_at: string;
  category?: ExpenseCategory;
}

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  items: ReceiptItem[];
  category_suggestion: string;
  confidence: number;
  raw_text: string;
}

export interface ReceiptItem {
  name: string;
  amount: number;
  quantity?: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

// ============================================================
// Habits
// ============================================================
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  frequency_days: number[];
  target_count: number;
  reminder_time: string | null;
  is_active: boolean;
  streak_count: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
  habit_logs?: HabitLog[];
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  count: number;
  notes: string | null;
  created_at: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

// ============================================================
// Energy
// ============================================================
export interface EnergyLog {
  id: string;
  user_id: string;
  date: string;
  level: EnergyLevel;
  mood: MoodLevel;
  notes: string | null;
  created_at: string;
}

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

// ============================================================
// AI Insights
// ============================================================
export interface AiInsight {
  id: string;
  user_id: string;
  type: InsightType;
  title: string;
  description: string;
  data: Json;
  priority: InsightPriority;
  is_premium: boolean;
  is_read: boolean;
  is_dismissed: boolean;
  generated_at: string;
  expires_at: string | null;
  created_at: string;
}

export type InsightType =
  | 'spending_pattern'
  | 'workout_consistency'
  | 'behavior_correlation'
  | 'energy_spending'
  | 'streak_prediction'
  | 'overspending_risk'
  | 'habit_performance'
  | 'cross_system'
  | 'weekly_summary'
  | 'monthly_review';

export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================
// Notifications
// ============================================================
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Json;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

export interface NotificationPreferences {
  workout_reminders: boolean;
  workout_reminder_time: string;
  streak_warnings: boolean;
  overspending_alerts: boolean;
  daily_checkins: boolean;
  daily_checkin_time: string;
  weekly_reports: boolean;
  ai_insights: boolean;
  email_notifications: boolean;
}

export type NotificationType =
  | 'workout_reminder'
  | 'streak_warning'
  | 'overspending_alert'
  | 'daily_checkin'
  | 'weekly_report'
  | 'ai_insight'
  | 'budget_alert'
  | 'habit_reminder'
  | 'system';

// ============================================================
// Subscriptions & Payments
// ============================================================
export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  payment_provider: PaymentProvider;
  payment_reference: string | null;
  currency: Currency;
  amount_paid: number;
  started_at: string;
  expires_at: string | null;
  is_lifetime: boolean;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlan = 'monthly' | 'annual' | 'lifetime';
export type PaymentProvider = 'nexapay' | 'aurpay';

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  prices: {
    USD: number;
    NGN: number;
    EUR: number;
    GBP: number;
  };
  billing_period: string;
  description: string;
  features: string[];
  is_popular: boolean;
  discount_crypto?: number;
}

// ============================================================
// Feedback
// ============================================================
export interface FeedbackReport {
  id: string;
  user_id: string | null;
  type: FeedbackType;
  rating: number | null;
  title: string;
  description: string;
  email: string | null;
  user_agent: string | null;
  created_at: string;
}

export type FeedbackType = 'feedback' | 'bug_report' | 'feature_request' | 'rating';

// ============================================================
// Dashboard
// ============================================================
export interface DashboardData {
  profile: Profile;
  today_workouts: number;
  today_steps: number;
  today_expenses: number;
  today_expenses_currency: Currency;
  active_streaks: number;
  active_habits_today: number;
  completed_habits_today: number;
  budget_used_percent: number;
  monthly_expense_total: number;
  recent_insights: AiInsight[];
  recent_notifications: Notification[];
  weekly_workout_data: WeeklyWorkoutData[];
  weekly_expense_data: WeeklyExpenseData[];
  streak_data: StreakData[];
}

export interface WeeklyWorkoutData {
  day: string;
  workouts: number;
  duration: number;
}

export interface WeeklyExpenseData {
  day: string;
  amount: number;
}

export interface StreakData {
  habit_name: string;
  streak: number;
  icon: string;
  color: string;
}

// ============================================================
// API Response Types
// ============================================================
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ============================================================
// Form Types
// ============================================================
export interface WorkoutFormData {
  name: string;
  notes?: string;
  duration_minutes?: number;
  exercises: WorkoutExerciseFormData[];
}

export interface WorkoutExerciseFormData {
  exercise_id: string;
  sets: WorkoutSetFormData[];
}

export interface WorkoutSetFormData {
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  notes?: string;
}

export interface ExpenseFormData {
  amount: number;
  category_id: string;
  description: string;
  merchant?: string;
  date: string;
  notes?: string;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
}

export interface BudgetFormData {
  total_income: number;
  currency: Currency;
  savings_goal_percent: number;
  category_limits: { category_id: string; limit_amount: number }[];
}

export interface HabitFormData {
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  frequency_days: number[];
  target_count: number;
  reminder_time?: string;
}

// ============================================================
// Offline / IndexedDB
// ============================================================
export interface OfflineAction {
  id: string;
  type: 'workout' | 'expense' | 'habit_log' | 'step_log' | 'energy_log';
  action: 'create' | 'update' | 'delete';
  data: Json;
  created_at: string;
  synced: boolean;
}
