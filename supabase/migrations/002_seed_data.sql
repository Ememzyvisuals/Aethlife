-- ============================================================
-- VitaFlow - Seed Data
-- Migration: 002_seed_data
-- ============================================================

-- ============================================================
-- DEFAULT EXPENSE CATEGORIES
-- ============================================================
INSERT INTO expense_categories (id, user_id, name, icon, color, is_default) VALUES
  (uuid_generate_v4(), NULL, 'Food & Dining',      '🍔', '#f59e0b', true),
  (uuid_generate_v4(), NULL, 'Transport',           '🚗', '#3b82f6', true),
  (uuid_generate_v4(), NULL, 'Shopping',            '🛍️',  '#8b5cf6', true),
  (uuid_generate_v4(), NULL, 'Entertainment',       '🎬', '#ec4899', true),
  (uuid_generate_v4(), NULL, 'Health & Fitness',    '💊', '#14b8a6', true),
  (uuid_generate_v4(), NULL, 'Utilities & Bills',   '⚡', '#6366f1', true),
  (uuid_generate_v4(), NULL, 'Housing & Rent',      '🏠', '#84cc16', true),
  (uuid_generate_v4(), NULL, 'Education',           '📚', '#0ea5e9', true),
  (uuid_generate_v4(), NULL, 'Personal Care',       '💆', '#f97316', true),
  (uuid_generate_v4(), NULL, 'Savings & Investment','💰', '#22c55e', true),
  (uuid_generate_v4(), NULL, 'Subscriptions',       '📱', '#a78bfa', true),
  (uuid_generate_v4(), NULL, 'Travel',              '✈️',  '#0891b2', true),
  (uuid_generate_v4(), NULL, 'Gifts & Donations',   '🎁', '#e11d48', true),
  (uuid_generate_v4(), NULL, 'Other',               '💳', '#64748b', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEFAULT EXERCISES CATALOG
-- ============================================================
INSERT INTO exercises (name, muscle_group, equipment, description, is_custom, user_id) VALUES
  -- Chest
  ('Bench Press',            'chest',    'barbell',    'Classic compound chest press using barbell', false, NULL),
  ('Dumbbell Bench Press',   'chest',    'dumbbell',   'Chest press with dumbbells for greater range', false, NULL),
  ('Incline Bench Press',    'chest',    'barbell',    'Upper chest focused barbell press', false, NULL),
  ('Push-Up',                'chest',    'bodyweight', 'Classic bodyweight chest exercise', false, NULL),
  ('Cable Fly',              'chest',    'cables',     'Cable crossover for chest isolation', false, NULL),
  ('Dip',                    'chest',    'bodyweight', 'Parallel bar dip targeting chest', false, NULL),
  ('Pec Deck Fly',           'chest',    'machine',    'Machine fly for chest isolation', false, NULL),

  -- Back
  ('Deadlift',               'back',     'barbell',    'Foundational compound posterior chain exercise', false, NULL),
  ('Pull-Up',                'back',     'bodyweight', 'Bodyweight vertical pulling exercise', false, NULL),
  ('Barbell Row',            'back',     'barbell',    'Compound horizontal barbell row', false, NULL),
  ('Seated Cable Row',       'back',     'cables',     'Cable horizontal row for back thickness', false, NULL),
  ('Lat Pulldown',           'back',     'machine',    'Machine exercise targeting latissimus dorsi', false, NULL),
  ('Single Arm Dumbbell Row','back',     'dumbbell',   'Unilateral dumbbell row for back', false, NULL),
  ('Face Pull',              'back',     'cables',     'Rear delt and upper back cable exercise', false, NULL),

  -- Shoulders
  ('Overhead Press',         'shoulders','barbell',    'Compound vertical push with barbell', false, NULL),
  ('Dumbbell Shoulder Press','shoulders','dumbbell',   'Seated or standing dumbbell overhead press', false, NULL),
  ('Lateral Raise',          'shoulders','dumbbell',   'Isolation for lateral deltoid', false, NULL),
  ('Front Raise',            'shoulders','dumbbell',   'Anterior deltoid isolation raise', false, NULL),
  ('Arnold Press',           'shoulders','dumbbell',   'Rotating dumbbell shoulder press', false, NULL),

  -- Biceps
  ('Barbell Curl',           'biceps',   'barbell',    'Classic standing barbell bicep curl', false, NULL),
  ('Dumbbell Curl',          'biceps',   'dumbbell',   'Alternating or simultaneous dumbbell curl', false, NULL),
  ('Hammer Curl',            'biceps',   'dumbbell',   'Neutral grip curl for brachialis', false, NULL),
  ('Preacher Curl',          'biceps',   'barbell',    'Strict curl on preacher bench', false, NULL),
  ('Cable Curl',             'biceps',   'cables',     'Constant tension bicep curl with cables', false, NULL),

  -- Triceps
  ('Tricep Dip',             'triceps',  'bodyweight', 'Bodyweight tricep isolation on bench', false, NULL),
  ('Skull Crusher',          'triceps',  'barbell',    'Lying tricep extension with barbell', false, NULL),
  ('Tricep Pushdown',        'triceps',  'cables',     'Cable tricep extension', false, NULL),
  ('Close Grip Bench',       'triceps',  'barbell',    'Compound tricep dominant bench press', false, NULL),
  ('Overhead Tricep Extension','triceps','dumbbell',   'Dumbbell overhead tricep extension', false, NULL),

  -- Legs
  ('Back Squat',             'legs',     'barbell',    'Primary compound leg exercise', false, NULL),
  ('Front Squat',            'legs',     'barbell',    'Quad-dominant barbell squat variation', false, NULL),
  ('Romanian Deadlift',      'legs',     'barbell',    'Hip hinge for hamstrings and glutes', false, NULL),
  ('Leg Press',              'legs',     'machine',    'Machine compound leg press', false, NULL),
  ('Leg Extension',          'legs',     'machine',    'Quad isolation machine exercise', false, NULL),
  ('Leg Curl',               'legs',     'machine',    'Hamstring isolation machine exercise', false, NULL),
  ('Calf Raise',             'legs',     'machine',    'Calf isolation exercise', false, NULL),
  ('Bulgarian Split Squat',  'legs',     'dumbbell',   'Unilateral leg exercise for quads', false, NULL),
  ('Walking Lunge',          'legs',     'dumbbell',   'Dynamic lunge for legs and glutes', false, NULL),

  -- Glutes
  ('Hip Thrust',             'glutes',   'barbell',    'Primary glute isolation exercise', false, NULL),
  ('Glute Bridge',           'glutes',   'bodyweight', 'Bodyweight glute activation', false, NULL),
  ('Cable Kickback',         'glutes',   'cables',     'Cable glute isolation exercise', false, NULL),
  ('Sumo Deadlift',          'glutes',   'barbell',    'Wide stance deadlift targeting glutes', false, NULL),

  -- Core
  ('Plank',                  'core',     'bodyweight', 'Isometric core stability exercise', false, NULL),
  ('Crunch',                 'core',     'bodyweight', 'Basic abdominal crunch', false, NULL),
  ('Cable Crunch',           'core',     'cables',     'Weighted cable crunch for abs', false, NULL),
  ('Russian Twist',          'core',     'bodyweight', 'Rotational core exercise', false, NULL),
  ('Hanging Leg Raise',      'core',     'bodyweight', 'Hanging ab raise for lower core', false, NULL),
  ('Ab Wheel Rollout',       'core',     'other',      'Ab wheel for full core activation', false, NULL),

  -- Cardio
  ('Running',                'cardio',   'other',      'Outdoor or treadmill running', false, NULL),
  ('Cycling',                'cardio',   'other',      'Stationary or outdoor cycling', false, NULL),
  ('Jump Rope',              'cardio',   'other',      'Skipping rope cardio', false, NULL),
  ('Rowing Machine',         'cardio',   'machine',    'Full body cardio rowing', false, NULL),
  ('Stair Climber',          'cardio',   'machine',    'Stair climbing machine', false, NULL),
  ('HIIT',                   'cardio',   'bodyweight', 'High intensity interval training', false, NULL),
  ('Swimming',               'cardio',   'other',      'Pool swimming for full body cardio', false, NULL),

  -- Full Body
  ('Burpee',                 'full_body','bodyweight', 'Full body explosive movement', false, NULL),
  ('Clean and Press',        'full_body','barbell',    'Olympic lift combining clean and press', false, NULL),
  ('Kettlebell Swing',       'full_body','kettlebell', 'Hip-driven kettlebell swing', false, NULL),
  ('Thruster',               'full_body','barbell',    'Squat to overhead press combination', false, NULL)

ON CONFLICT DO NOTHING;
