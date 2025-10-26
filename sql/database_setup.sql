-- Database schema setup for Gym Website
-- Run these SQL commands in the Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Members Table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('basic', 'premium', 'vip')),
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  duration INTEGER NOT NULL CHECK (duration > 0),
  calories_burned INTEGER CHECK (calories_burned > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Diet Plans Table
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL CHECK (calories > 0),
  protein INTEGER NOT NULL CHECK (protein >= 0),
  carbs INTEGER NOT NULL CHECK (carbs >= 0),
  fat INTEGER NOT NULL CHECK (fat >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Member Workout Plans Table (for assignments)
CREATE TABLE IF NOT EXISTS member_workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Member Diet Plans Table (for assignments)
CREATE TABLE IF NOT EXISTS member_diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'cash', 'bank_transfer', 'other')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fitness Progress Tracking Table
CREATE TABLE IF NOT EXISTS fitness_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  resting_heart_rate INTEGER,
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables to maintain updated_at
CREATE TRIGGER update_members_modtime
BEFORE UPDATE ON members
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_workouts_modtime
BEFORE UPDATE ON workouts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_diet_plans_modtime
BEFORE UPDATE ON diet_plans
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_attendance_modtime
BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_member_workout_plans_modtime
BEFORE UPDATE ON member_workout_plans
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_member_diet_plans_modtime
BEFORE UPDATE ON member_diet_plans
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payments_modtime
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_fitness_progress_modtime
BEFORE UPDATE ON fitness_progress
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create stored procedure for calculating average gym time
CREATE OR REPLACE FUNCTION calculate_average_gym_time()
RETURNS TABLE (
  average_duration_minutes DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT AVG(EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 60)::DECIMAL
  FROM attendance
  WHERE check_out_time IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for getting member signups by month
CREATE OR REPLACE FUNCTION get_member_signups_by_month()
RETURNS TABLE (
  month TEXT,
  year INTEGER,
  signup_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(join_date, 'Month') as month,
    EXTRACT(YEAR FROM join_date)::INTEGER as year,
    COUNT(*)::INTEGER as signup_count
  FROM 
    members
  GROUP BY 
    EXTRACT(YEAR FROM join_date),
    TO_CHAR(join_date, 'Month'),
    EXTRACT(MONTH FROM join_date)
  ORDER BY 
    year DESC,
    EXTRACT(MONTH FROM join_date) DESC;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for getting gym usage by day of week
CREATE OR REPLACE FUNCTION get_gym_usage_by_day_of_week()
RETURNS TABLE (
  day_of_week TEXT,
  check_in_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(check_in_time, 'Day') as day_of_week,
    COUNT(*)::INTEGER as check_in_count
  FROM 
    attendance
  GROUP BY 
    TO_CHAR(check_in_time, 'Day'),
    EXTRACT(DOW FROM check_in_time)
  ORDER BY 
    EXTRACT(DOW FROM check_in_time);
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for getting peak gym hours
CREATE OR REPLACE FUNCTION get_peak_gym_hours()
RETURNS TABLE (
  hour_of_day INTEGER,
  check_in_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM check_in_time)::INTEGER as hour_of_day,
    COUNT(*)::INTEGER as check_in_count
  FROM 
    attendance
  GROUP BY 
    EXTRACT(HOUR FROM check_in_time)
  ORDER BY 
    check_in_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for registering a new member
CREATE OR REPLACE FUNCTION register_new_member(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_membership_type TEXT DEFAULT 'basic'
) 
RETURNS UUID AS $$
DECLARE
  v_member_id UUID;
BEGIN
  -- Insert the new member
  INSERT INTO members (
    name,
    email,
    phone,
    membership_type
  ) VALUES (
    p_name,
    p_email,
    p_phone,
    p_membership_type
  )
  RETURNING id INTO v_member_id;
  
  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for recording a gym session
CREATE OR REPLACE FUNCTION record_gym_session(
  member_id UUID,
  duration_minutes INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_attendance_id UUID;
  v_member_name TEXT;
  v_check_in_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the member's name
  SELECT name INTO v_member_name
  FROM members
  WHERE id = member_id;
  
  -- Calculate check-in time
  v_check_in_time := NOW() - (duration_minutes * INTERVAL '1 minute');
  
  -- Record attendance
  INSERT INTO attendance (
    member_id,
    member_name,
    check_in_time,
    check_out_time
  ) VALUES (
    member_id,
    v_member_name,
    v_check_in_time,
    NOW()
  )
  RETURNING id INTO v_attendance_id;
  
  RETURN v_attendance_id;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for getting member fitness stats
CREATE OR REPLACE FUNCTION get_member_fitness_stats(
  p_member_id UUID
)
RETURNS TABLE (
  avg_session_minutes DECIMAL,
  total_sessions INTEGER,
  total_calories_burned INTEGER,
  recent_weight DECIMAL,
  recent_body_fat DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH member_sessions AS (
    SELECT 
      a.id,
      EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time)) / 60 as duration_minutes
    FROM 
      attendance a
    WHERE 
      a.member_id = p_member_id AND 
      a.check_out_time IS NOT NULL
  ),
  member_workouts AS (
    SELECT 
      w.calories_burned
    FROM 
      member_workout_plans mwp
      JOIN workouts w ON mwp.workout_id = w.id
    WHERE 
      mwp.member_id = p_member_id AND
      mwp.completed = TRUE
  ),
  recent_fitness AS (
    SELECT 
      weight,
      body_fat_percentage
    FROM 
      fitness_progress
    WHERE 
      member_id = p_member_id
    ORDER BY 
      measurement_date DESC
    LIMIT 1
  )
  SELECT 
    AVG(ms.duration_minutes)::DECIMAL as avg_session_minutes,
    COUNT(DISTINCT ms.id)::INTEGER as total_sessions,
    COALESCE(SUM(mw.calories_burned), 0)::INTEGER as total_calories_burned,
    rf.weight as recent_weight,
    rf.body_fat_percentage as recent_body_fat
  FROM 
    (SELECT 1) dummy
    LEFT JOIN member_sessions ms ON TRUE
    LEFT JOIN member_workouts mw ON TRUE
    LEFT JOIN recent_fitness rf ON TRUE
  GROUP BY
    rf.weight, rf.body_fat_percentage;
END;
$$ LANGUAGE plpgsql;

-- Add Row-Level Security (RLS) policies
-- This requires enabling RLS in Supabase

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Members table read access" ON members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Workouts table read access" ON workouts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Diet plans table read access" ON diet_plans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Attendance table read access" ON attendance FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for allowing members to see only their own data
CREATE POLICY "Members can view their own data" ON members FOR SELECT USING (
  auth.uid() = id::text
);

CREATE POLICY "Members can view their own attendance" ON attendance FOR SELECT USING (
  auth.uid()::text = member_id::text
);

CREATE POLICY "Members can view their own workout plans" ON member_workout_plans FOR SELECT USING (
  auth.uid()::text = member_id::text
);

CREATE POLICY "Members can view their own diet plans" ON member_diet_plans FOR SELECT USING (
  auth.uid()::text = member_id::text
);

CREATE POLICY "Members can view their own payments" ON payments FOR SELECT USING (
  auth.uid()::text = member_id::text
);

CREATE POLICY "Members can view their own fitness progress" ON fitness_progress FOR SELECT USING (
  auth.uid()::text = member_id::text
);

-- Create admin policies
CREATE POLICY "Admins have full access to members" ON members 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

CREATE POLICY "Admins have full access to workouts" ON workouts 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

CREATE POLICY "Admins have full access to diet plans" ON diet_plans 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

CREATE POLICY "Admins have full access to attendance" ON attendance 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

CREATE POLICY "Admins have full access to member workout plans" ON member_workout_plans 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

CREATE POLICY "Admins have full access to member diet plans" ON member_diet_plans 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

CREATE POLICY "Admins have full access to payments" ON payments 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

CREATE POLICY "Admins have full access to fitness progress" ON fitness_progress 
FOR ALL USING (auth.jwt() ? 'admin' AND auth.jwt()->>'admin' = 'true');

-- Insert sample data
-- Uncomment and modify these inserts for your testing needs

-- INSERT INTO members (name, email, phone, membership_type)
-- VALUES
--   ('John Doe', 'john@example.com', '123-456-7890', 'premium'),
--   ('Jane Smith', 'jane@example.com', '987-654-3210', 'basic'),
--   ('Mike Johnson', 'mike@example.com', '555-123-4567', 'vip');
-- 
-- INSERT INTO workouts (name, description, difficulty, duration, calories_burned)
-- VALUES
--   ('Beginner Cardio', 'A gentle cardio workout for beginners', 'beginner', 30, 200),
--   ('Intermediate Strength', 'Weight training for intermediate level', 'intermediate', 45, 350),
--   ('Advanced HIIT', 'High intensity interval training', 'advanced', 60, 600);
-- 
-- INSERT INTO diet_plans (name, description, calories, protein, carbs, fat)
-- VALUES
--   ('Weight Loss Plan', 'Calorie-restricted diet for fat loss', 1500, 130, 100, 50),
--   ('Muscle Gain', 'High protein diet for muscle building', 2800, 220, 250, 70),
--   ('Maintenance', 'Balanced diet for weight maintenance', 2200, 150, 220, 65);
-- 
-- -- Insert sample attendance records
-- INSERT INTO attendance (member_id, member_name, check_in_time, check_out_time)
-- SELECT 
--   id, 
--   name, 
--   NOW() - (RANDOM() * INTERVAL '7 days'),
--   NOW() - (RANDOM() * INTERVAL '5 hours')
-- FROM members
-- LIMIT 3; 