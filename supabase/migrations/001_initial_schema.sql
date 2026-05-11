-- ============================================================
-- VitaFlow - Complete Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN', 'EUR', 'GBP')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  fcm_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_tier, subscription_status);

-- ============================================================
-- ONBOARDING PREFERENCES
-- ============================================================
CREATE TABLE onboarding_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  goals TEXT[] NOT NULL DEFAULT '{}',
  join_reason TEXT NOT NULL DEFAULT '',
  fitness_goals TEXT[] NOT NULL DEFAULT '{}',
  budget_goals TEXT[] NOT NULL DEFAULT '{}',
  notification_preferences JSONB NOT NULL DEFAULT '{
    "workout_reminders": true,
    "workout_reminder_time": "08:00",
    "streak_warnings": true,
    "overspending_alerts": true,
    "daily_checkins": true,
    "daily_checkin_time": "09:00",
    "weekly_reports": true,
    "ai_insights": true,
    "email_notifications": true
  }'::jsonb,
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_onboarding_user_id ON onboarding_preferences(user_id);

-- ============================================================
-- EXERCISES (Catalog)
-- ============================================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL CHECK (muscle_group IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'core', 'cardio', 'full_body', 'other')),
  equipment TEXT NOT NULL DEFAULT 'bodyweight' CHECK (equipment IN ('barbell', 'dumbbell', 'machine', 'cables', 'bodyweight', 'resistance_band', 'kettlebell', 'other')),
  description TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_name_trgm ON exercises USING gin(name gin_trgm_ops);

-- ============================================================
-- WORKOUTS
-- ============================================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_template BOOLEAN NOT NULL DEFAULT false,
  template_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_completed_at ON workouts(user_id, completed_at DESC);
CREATE INDEX idx_workouts_template ON workouts(user_id, is_template);

-- ============================================================
-- WORKOUT LOGS (Sets/Reps)
-- ============================================================
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  reps INTEGER CHECK (reps >= 0),
  weight_kg NUMERIC(8,2) CHECK (weight_kg >= 0),
  duration_seconds INTEGER CHECK (duration_seconds > 0),
  distance_meters NUMERIC(10,2) CHECK (distance_meters >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_workout_id ON workout_logs(workout_id);
CREATE INDEX idx_workout_logs_exercise_id ON workout_logs(exercise_id);

-- ============================================================
-- STEP LOGS
-- ============================================================
CREATE TABLE step_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  steps INTEGER NOT NULL CHECK (steps >= 0),
  distance_km NUMERIC(8,2) CHECK (distance_km >= 0),
  calories_burned INTEGER CHECK (calories_burned >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_step_logs_user_date ON step_logs(user_id, date DESC);

-- ============================================================
-- EXPENSE CATEGORIES
-- ============================================================
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💰',
  color TEXT NOT NULL DEFAULT '#14b8a6',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN', 'EUR', 'GBP')),
  description TEXT NOT NULL,
  merchant TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_expense_id UUID,
  receipt_url TEXT,
  receipt_data JSONB,
  ai_scanned BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON expenses(user_id, category_id);
CREATE INDEX idx_expenses_merchant_trgm ON expenses USING gin(COALESCE(merchant, '') gin_trgm_ops);

-- ============================================================
-- RECURRING EXPENSES
-- ============================================================
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  merchant TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  next_due_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX idx_recurring_expenses_due ON recurring_expenses(next_due_date) WHERE is_active = true;

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  total_income NUMERIC(15,2) NOT NULL CHECK (total_income >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  savings_goal_percent NUMERIC(5,2) NOT NULL DEFAULT 20 CHECK (savings_goal_percent BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(user_id, year DESC, month DESC);

-- ============================================================
-- BUDGET CATEGORY LIMITS
-- ============================================================
CREATE TABLE budget_category_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE NOT NULL,
  limit_amount NUMERIC(15,2) NOT NULL CHECK (limit_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(budget_id, category_id)
);

CREATE INDEX idx_budget_limits_budget_id ON budget_category_limits(budget_id);

-- ============================================================
-- HABITS
-- ============================================================
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '⭐',
  color TEXT NOT NULL DEFAULT '#14b8a6',
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  frequency_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  target_count INTEGER NOT NULL DEFAULT 1 CHECK (target_count > 0),
  reminder_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_active ON habits(user_id, is_active);

-- ============================================================
-- HABIT LOGS
-- ============================================================
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, date DESC);

-- ============================================================
-- ENERGY LOGS
-- ============================================================
CREATE TABLE energy_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_energy_logs_user_date ON energy_logs(user_id, date DESC);

-- ============================================================
-- AI INSIGHTS
-- ============================================================
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('spending_pattern', 'workout_consistency', 'behavior_correlation', 'energy_spending', 'streak_prediction', 'overspending_risk', 'habit_performance', 'cross_system', 'weekly_summary', 'monthly_review')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_unread ON ai_insights(user_id, is_read, is_dismissed);
CREATE INDEX idx_ai_insights_type ON ai_insights(user_id, type);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout_reminder', 'streak_warning', 'overspending_alert', 'daily_checkin', 'weekly_report', 'ai_insight', 'budget_alert', 'habit_reminder', 'system')),
  data JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_sent ON notifications(user_id, sent_at DESC);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'annual', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('nexapay', 'aurpay')),
  payment_reference TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  amount_paid NUMERIC(15,2) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_lifetime BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(user_id, status);

-- ============================================================
-- FEEDBACK REPORTS
-- ============================================================
CREATE TABLE feedback_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'bug_report', 'feature_request', 'rating')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback_reports(user_id);
CREATE INDEX idx_feedback_type ON feedback_reports(type, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_category_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Onboarding policies
CREATE POLICY "Users can manage own onboarding" ON onboarding_preferences FOR ALL USING (auth.uid() = user_id);

-- Exercises policies
CREATE POLICY "Users can view default and own exercises" ON exercises FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can create own exercises" ON exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON exercises FOR DELETE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can manage own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can manage own workout logs" ON workout_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_logs.workout_id AND workouts.user_id = auth.uid())
);

-- Step logs policies
CREATE POLICY "Users can manage own step logs" ON step_logs FOR ALL USING (auth.uid() = user_id);

-- Expense categories policies
CREATE POLICY "Users can view default and own categories" ON expense_categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can manage own categories" ON expense_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON expense_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON expense_categories FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- Recurring expenses policies
CREATE POLICY "Users can manage own recurring expenses" ON recurring_expenses FOR ALL USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

-- Budget category limits policies
CREATE POLICY "Users can manage own budget limits" ON budget_category_limits FOR ALL USING (
  EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_category_limits.budget_id AND budgets.user_id = auth.uid())
);

-- Habits policies
CREATE POLICY "Users can manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can manage own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- Energy logs policies
CREATE POLICY "Users can manage own energy logs" ON energy_logs FOR ALL USING (auth.uid() = user_id);

-- AI insights policies
CREATE POLICY "Users can view own insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON ai_insights FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can submit feedback" ON feedback_reports FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own feedback" ON feedback_reports FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO onboarding_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
