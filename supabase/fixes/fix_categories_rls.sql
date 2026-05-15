-- ============================================================
-- AethLife — Fix expense_categories RLS
-- Run this in Supabase → SQL Editor
-- Allows users to read both global categories (user_id IS NULL)
-- and their own custom categories
-- ============================================================

-- Drop the restrictive old policy if it exists
DROP POLICY IF EXISTS "Users can view own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can read expense categories" ON expense_categories;

-- Create correct policy that allows both global and user-specific
CREATE POLICY "Users can read global and own categories"
  ON expense_categories
  FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Ensure global categories exist (run if table is empty)
INSERT INTO expense_categories (name, color, icon, user_id) VALUES
  ('Food & Dining',    '#f59e0b', 'utensils',     NULL),
  ('Transport',        '#3b82f6', 'car',           NULL),
  ('Shopping',         '#8b5cf6', 'shopping-bag',  NULL),
  ('Healthcare',       '#ef4444', 'heart',         NULL),
  ('Bills & Utilities','#f97316', 'zap',           NULL),
  ('Entertainment',    '#14b8a6', 'film',          NULL),
  ('Education',        '#6366f1', 'book',          NULL),
  ('Savings',          '#10b981', 'piggy-bank',    NULL),
  ('Personal Care',    '#ec4899', 'smile',         NULL),
  ('Other',            '#94a3b8', 'package',       NULL)
ON CONFLICT DO NOTHING;
