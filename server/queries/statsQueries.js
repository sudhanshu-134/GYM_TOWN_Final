// SQL queries for the gym statistics display

/**
 * Query to get member signups by month
 * Returns count of signups grouped by month
 */
const memberSignupsByMonth = `
  SELECT 
    to_char(created_at, 'YYYY-MM') as month,
    count(*) as count
  FROM members
  WHERE created_at >= date_trunc('year', current_date)
  GROUP BY month
  ORDER BY month
`;

/**
 * Query to get gym usage by day of week
 * Returns average check-ins per day of the week
 */
const gymUsageByDayOfWeek = `
  SELECT 
    extract(DOW from check_in_time) as day_of_week,
    count(*) as total_visits,
    count(distinct member_id) as unique_members
  FROM attendance
  WHERE check_in_time >= current_date - interval '30 days'
  GROUP BY day_of_week
  ORDER BY day_of_week
`;

/**
 * Query to get peak gym hours
 * Returns count of check-ins by hour of day
 */
const peakGymHours = `
  SELECT 
    extract(HOUR from check_in_time) as hour_of_day,
    count(*) as check_ins
  FROM attendance
  WHERE check_in_time >= current_date - interval '30 days'
  GROUP BY hour_of_day
  ORDER BY hour_of_day
`;

/**
 * Query to get average gym session duration
 * Returns the average time between check-in and check-out
 */
const averageGymTime = `
  SELECT 
    avg(extract(EPOCH from (check_out_time - check_in_time)) / 60) as avg_minutes
  FROM attendance
  WHERE 
    check_in_time >= current_date - interval '30 days'
    AND check_out_time IS NOT NULL
`;

/**
 * Query to get top workouts by calories burned
 * Returns workouts with highest average calorie burn from workout_logs
 */
const topWorkouts = `
  SELECT 
    w.workout_name,
    ROUND(AVG(wl.calories_burned)) as avg_calories,
    COUNT(DISTINCT wl.member_id) as member_count
  FROM workout_logs wl
  JOIN workouts w ON wl.workout_id = w.id
  WHERE wl.date >= current_date - interval '30 days'
  GROUP BY w.workout_name
  ORDER BY avg_calories DESC
  LIMIT 10
`;

/**
 * Query to get current members in the gym
 * Returns members who have checked in but not checked out
 */
const currentMembersInGym = `
  SELECT 
    m.id,
    m.first_name,
    m.last_name,
    a.check_in_time,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - a.check_in_time)) / 60 as minutes_in_gym
  FROM attendance a
  JOIN members m ON a.member_id = m.id
  WHERE 
    a.check_in_time >= current_date
    AND a.check_out_time IS NULL
  ORDER BY a.check_in_time ASC
`;

/**
 * Query to get member retention rate
 * Returns the percentage of members who have visited in the last 30 days
 */
const memberRetentionRate = `
  WITH active_members AS (
    SELECT DISTINCT member_id
    FROM attendance
    WHERE check_in_time >= current_date - interval '30 days'
  ),
  total_members AS (
    SELECT count(*) as count FROM members
    WHERE created_at <= current_date - interval '30 days'
  )
  SELECT 
    (SELECT count(*) FROM active_members) as active_count,
    (SELECT count FROM total_members) as total_count,
    ROUND(((SELECT count(*) FROM active_members)::numeric / 
           (SELECT count FROM total_members)::numeric) * 100, 2) as retention_rate
`;

/**
 * Query to get member attendance frequency
 * Returns distribution of how often members visit the gym
 */
const memberAttendanceFrequency = `
  WITH member_visits AS (
    SELECT 
      member_id,
      count(*) as visit_count
    FROM attendance
    WHERE check_in_time >= current_date - interval '30 days'
    GROUP BY member_id
  )
  SELECT 
    CASE
      WHEN visit_count >= 20 THEN '5+ times per week'
      WHEN visit_count >= 12 THEN '3-4 times per week'
      WHEN visit_count >= 4 THEN '1-2 times per week'
      ELSE 'Less than once a week'
    END as frequency_group,
    count(*) as member_count
  FROM member_visits
  GROUP BY frequency_group
  ORDER BY 
    CASE frequency_group
      WHEN '5+ times per week' THEN 1
      WHEN '3-4 times per week' THEN 2
      WHEN '1-2 times per week' THEN 3
      ELSE 4
    END
`;

module.exports = {
  memberSignupsByMonth,
  gymUsageByDayOfWeek,
  peakGymHours,
  averageGymTime,
  topWorkouts,
  currentMembersInGym,
  memberRetentionRate,
  memberAttendanceFrequency
}; 