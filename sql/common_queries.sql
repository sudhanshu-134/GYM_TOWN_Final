-- Common SQL Queries for Gym Website
-- These queries can be executed directly in Supabase's SQL Editor
-- or used with the Supabase client

-- ===== MEMBER QUERIES =====

-- 1. Get all active members
SELECT *
FROM members
WHERE status = 'active'
ORDER BY name ASC;

-- 2. Get members who joined in the last 30 days
SELECT *
FROM members
WHERE join_date >= NOW() - INTERVAL '30 days'
ORDER BY join_date DESC;

-- 3. Count members by membership type
SELECT 
  membership_type, 
  COUNT(*) as member_count
FROM members
GROUP BY membership_type
ORDER BY member_count DESC;

-- 4. Find members with expiring memberships (assuming you add an expiry_date column)
-- ALTER TABLE members ADD COLUMN membership_expiry_date DATE;
SELECT 
  id, 
  name, 
  email, 
  membership_type, 
  membership_expiry_date
FROM members
WHERE 
  membership_expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '14 days')
ORDER BY membership_expiry_date ASC;

-- 5. Search members by name, email, or phone
SELECT *
FROM members
WHERE 
  name ILIKE '%search_term%' OR
  email ILIKE '%search_term%' OR
  phone ILIKE '%search_term%';

-- ===== WORKOUT QUERIES =====

-- 1. Get workouts by difficulty level
SELECT *
FROM workouts
WHERE difficulty = 'beginner' -- Change to desired difficulty
ORDER BY duration ASC;

-- 2. Get workouts sorted by calories burned (most effective first)
SELECT *
FROM workouts
ORDER BY calories_burned DESC
LIMIT 10;

-- 3. Get workouts with duration between 30-45 minutes
SELECT *
FROM workouts
WHERE duration BETWEEN 30 AND 45
ORDER BY difficulty ASC;

-- 4. Find workouts by keyword in name or description
SELECT *
FROM workouts
WHERE 
  name ILIKE '%cardio%' OR
  description ILIKE '%cardio%';

-- ===== DIET PLAN QUERIES =====

-- 1. Get diet plans in a specific calorie range
SELECT *
FROM diet_plans
WHERE calories BETWEEN 1500 AND 2000
ORDER BY calories ASC;

-- 2. Get high protein diet plans (> 30% of calories from protein)
-- Note: 1g protein = 4 calories
SELECT *,
  (protein * 4) as protein_calories,
  ROUND((protein * 4) / calories * 100) as protein_percentage
FROM diet_plans
WHERE (protein * 4) / calories >= 0.3
ORDER BY (protein * 4) / calories DESC;

-- 3. Get low carb diet plans (< 25% of calories from carbs)
-- Note: 1g carbs = 4 calories
SELECT *,
  (carbs * 4) as carb_calories,
  ROUND((carbs * 4) / calories * 100) as carb_percentage
FROM diet_plans
WHERE (carbs * 4) / calories <= 0.25
ORDER BY (carbs * 4) / calories ASC;

-- ===== ATTENDANCE QUERIES =====

-- 1. Get today's attendance
SELECT 
  a.id,
  a.member_id,
  a.member_name,
  a.check_in_time,
  a.check_out_time,
  EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time)) / 60 as duration_minutes
FROM attendance a
WHERE 
  DATE(a.check_in_time) = CURRENT_DATE
ORDER BY a.check_in_time DESC;

-- 2. Get current members in gym (checked in but not out)
SELECT
  a.id,
  a.member_id,
  a.member_name,
  a.check_in_time,
  NOW() - a.check_in_time as time_in_gym
FROM attendance a
WHERE 
  a.check_out_time IS NULL
ORDER BY a.check_in_time ASC;

-- 3. Get gym attendance for a date range
SELECT 
  DATE(check_in_time) as date,
  COUNT(*) as check_ins
FROM attendance
WHERE 
  check_in_time BETWEEN '2023-09-01' AND '2023-09-30'
GROUP BY DATE(check_in_time)
ORDER BY date ASC;

-- 4. Calculate average gym session duration (in minutes)
SELECT 
  AVG(EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 60) as avg_duration_minutes
FROM attendance
WHERE check_out_time IS NOT NULL;

-- 5. Find gym peak hours
SELECT 
  EXTRACT(DOW FROM check_in_time) as day_of_week,
  EXTRACT(HOUR FROM check_in_time) as hour_of_day,
  COUNT(*) as check_ins
FROM attendance
GROUP BY day_of_week, hour_of_day
ORDER BY check_ins DESC;

-- ===== MEMBER WORKOUT ASSIGNMENT QUERIES =====

-- 1. Get all workouts assigned to a specific member
SELECT 
  mwp.id,
  w.name as workout_name,
  w.difficulty,
  w.duration,
  mwp.assigned_date,
  mwp.completed,
  mwp.completion_date
FROM member_workout_plans mwp
JOIN workouts w ON mwp.workout_id = w.id
WHERE 
  mwp.member_id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID
ORDER BY mwp.assigned_date DESC;

-- 2. Get all incomplete workout assignments
SELECT 
  mwp.id,
  m.name as member_name,
  w.name as workout_name,
  w.difficulty,
  mwp.assigned_date
FROM member_workout_plans mwp
JOIN members m ON mwp.member_id = m.id
JOIN workouts w ON mwp.workout_id = w.id
WHERE 
  mwp.completed = FALSE
ORDER BY mwp.assigned_date ASC;

-- 3. Get completion rate for assigned workouts
SELECT 
  m.id as member_id,
  m.name as member_name,
  COUNT(mwp.id) as total_assigned,
  SUM(CASE WHEN mwp.completed THEN 1 ELSE 0 END) as completed,
  ROUND(SUM(CASE WHEN mwp.completed THEN 1 ELSE 0 END)::numeric / COUNT(mwp.id) * 100, 2) as completion_percentage
FROM members m
LEFT JOIN member_workout_plans mwp ON m.id = mwp.member_id
GROUP BY m.id, m.name
ORDER BY completion_percentage DESC;

-- ===== MEMBER DIET PLAN ASSIGNMENT QUERIES =====

-- 1. Get all current diet plans for members
SELECT 
  mdp.id,
  m.name as member_name,
  dp.name as diet_plan_name,
  dp.calories,
  dp.protein,
  dp.carbs,
  dp.fat,
  mdp.assigned_date,
  mdp.end_date
FROM member_diet_plans mdp
JOIN members m ON mdp.member_id = m.id
JOIN diet_plans dp ON mdp.diet_plan_id = dp.id
WHERE 
  (mdp.end_date IS NULL OR mdp.end_date >= CURRENT_DATE)
ORDER BY m.name ASC;

-- ===== PAYMENT QUERIES =====

-- 1. Get all payments for a specific member
SELECT 
  p.id,
  p.amount,
  p.payment_date,
  p.payment_method,
  p.status,
  p.notes
FROM payments p
WHERE p.member_id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID
ORDER BY p.payment_date DESC;

-- 2. Calculate total revenue by month
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  SUM(amount) as total_revenue
FROM payments
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;

-- 3. Calculate revenue by payment method
SELECT 
  payment_method,
  COUNT(*) as payment_count,
  SUM(amount) as total_amount
FROM payments
WHERE status = 'completed'
GROUP BY payment_method
ORDER BY total_amount DESC;

-- ===== FITNESS PROGRESS QUERIES =====

-- 1. Get latest fitness measurements for a member
SELECT 
  fp.weight,
  fp.height,
  fp.body_fat_percentage,
  fp.muscle_mass,
  fp.resting_heart_rate,
  fp.measurement_date,
  fp.notes
FROM fitness_progress fp
WHERE 
  fp.member_id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID
ORDER BY fp.measurement_date DESC
LIMIT 1;

-- 2. Track weight changes over time for a member
SELECT 
  fp.measurement_date,
  fp.weight
FROM fitness_progress fp
WHERE 
  fp.member_id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID
ORDER BY fp.measurement_date ASC;

-- 3. Calculate body fat percentage changes for a member
SELECT 
  fp.measurement_date,
  fp.body_fat_percentage,
  fp.body_fat_percentage - LAG(fp.body_fat_percentage) OVER (ORDER BY fp.measurement_date) as change
FROM fitness_progress fp
WHERE 
  fp.member_id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID
ORDER BY fp.measurement_date ASC;

-- ===== COMPLEX QUERIES =====

-- 1. Get member fitness dashboard data
SELECT 
  m.id,
  m.name,
  m.email,
  m.membership_type,
  (SELECT COUNT(*) FROM attendance a WHERE a.member_id = m.id) as total_visits,
  (SELECT MAX(a.check_in_time) FROM attendance a WHERE a.member_id = m.id) as last_visit,
  (SELECT fp.weight FROM fitness_progress fp WHERE fp.member_id = m.id ORDER BY fp.measurement_date DESC LIMIT 1) as current_weight,
  (SELECT fp.body_fat_percentage FROM fitness_progress fp WHERE fp.member_id = m.id ORDER BY fp.measurement_date DESC LIMIT 1) as current_body_fat,
  (SELECT COUNT(*) FROM member_workout_plans mwp WHERE mwp.member_id = m.id AND mwp.completed = TRUE) as completed_workouts
FROM members m
WHERE m.id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID

-- 2. Find members who haven't visited in 30 days
SELECT 
  m.id,
  m.name,
  m.email,
  m.phone,
  MAX(a.check_in_time) as last_visit,
  NOW() - MAX(a.check_in_time) as time_since_last_visit
FROM members m
LEFT JOIN attendance a ON m.id = a.member_id
WHERE m.status = 'active'
GROUP BY m.id, m.name, m.email, m.phone
HAVING MAX(a.check_in_time) < NOW() - INTERVAL '30 days' OR MAX(a.check_in_time) IS NULL
ORDER BY last_visit ASC NULLS FIRST;

-- 3. Get member fitness metrics with progress indicators
WITH latest_metrics AS (
  SELECT DISTINCT ON (member_id)
    member_id,
    weight,
    body_fat_percentage,
    muscle_mass,
    measurement_date
  FROM fitness_progress
  ORDER BY member_id, measurement_date DESC
),
previous_metrics AS (
  SELECT fp.member_id,
    fp.weight,
    fp.body_fat_percentage,
    fp.muscle_mass
  FROM fitness_progress fp
  JOIN latest_metrics lm ON fp.member_id = lm.member_id
  WHERE fp.measurement_date < lm.measurement_date
  ORDER BY fp.measurement_date DESC
  LIMIT 1
)
SELECT 
  m.name,
  lm.weight as current_weight,
  lm.body_fat_percentage as current_bf,
  lm.muscle_mass as current_mm,
  lm.weight - pm.weight as weight_change,
  lm.body_fat_percentage - pm.body_fat_percentage as bf_change,
  lm.muscle_mass - pm.muscle_mass as mm_change
FROM members m
JOIN latest_metrics lm ON m.id = lm.member_id
LEFT JOIN previous_metrics pm ON m.id = pm.member_id
WHERE m.id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b'; -- Replace with actual UUID

-- 4. Get member workout recommendations based on history
WITH member_history AS (
  SELECT 
    mwp.member_id,
    w.difficulty,
    COUNT(*) as workout_count
  FROM member_workout_plans mwp
  JOIN workouts w ON mwp.workout_id = w.id
  WHERE mwp.completed = TRUE
  GROUP BY mwp.member_id, w.difficulty
)
SELECT 
  w.id,
  w.name,
  w.difficulty,
  w.duration,
  w.calories_burned
FROM workouts w
WHERE w.difficulty = (
  SELECT difficulty 
  FROM member_history 
  WHERE member_id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID
  ORDER BY workout_count DESC 
  LIMIT 1
)
AND w.id NOT IN (
  SELECT workout_id 
  FROM member_workout_plans 
  WHERE member_id = '8f7d2a1b-3c4e-5f6d-7a8b-9c0d1e2f3a4b' -- Replace with actual UUID
)
LIMIT 5; 