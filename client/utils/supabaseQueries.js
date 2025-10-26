import { supabase } from './supabase';

/**
 * Advanced queries for Supabase
 * These functions demonstrate how to use SQL with Supabase
 */

// ---- MEMBERS QUERIES ----

/**
 * Get all members with their attendance counts
 */
export async function getMembersWithAttendanceCounts() {
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        attendance_count:attendance(count)
      `);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting members with attendance:', err);
    throw err;
  }
}

/**
 * Search members by name, email or phone
 */
export async function searchMembers(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error searching members:', err);
    throw err;
  }
}

/**
 * Get members with a specific membership type
 */
export async function getMembersByMembershipType(membershipType) {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('membership_type', membershipType);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting members by type:', err);
    throw err;
  }
}

// ---- WORKOUTS QUERIES ----

/**
 * Get workouts filtered by difficulty and duration
 */
export async function getWorkoutsByDifficultyAndDuration(difficulty, minDuration, maxDuration) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('difficulty', difficulty)
      .gte('duration', minDuration)
      .lte('duration', maxDuration);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error filtering workouts:', err);
    throw err;
  }
}

/**
 * Get workouts ordered by calories burned (highest first)
 */
export async function getWorkoutsOrderedByCalories(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('calories_burned', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting workouts by calories:', err);
    throw err;
  }
}

// ---- DIET PLANS QUERIES ----

/**
 * Get diet plans filtered by calorie range
 */
export async function getDietPlansByCalorieRange(minCalories, maxCalories) {
  try {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .gte('calories', minCalories)
      .lte('calories', maxCalories);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error filtering diet plans:', err);
    throw err;
  }
}

/**
 * Get diet plans with high protein (protein > 30% of total calories)
 */
export async function getHighProteinDietPlans() {
  try {
    // Calculate protein percentage (1g protein = 4 calories)
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .gte('protein', 'calories * 0.075'); // 30% / 4 = 0.075

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting high protein plans:', err);
    throw err;
  }
}

// ---- ATTENDANCE QUERIES ----

/**
 * Get attendance for a specific date range
 */
export async function getAttendanceByDateRange(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, member:members(name)')
      .gte('check_in_time', startDate)
      .lte('check_in_time', endDate);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting attendance by date:', err);
    throw err;
  }
}

/**
 * Get current members in gym (checked in but not checked out)
 */
export async function getCurrentMembersInGym() {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, member:members(name)')
      .is('check_out_time', null);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting current members in gym:', err);
    throw err;
  }
}

/**
 * Get average time spent by members in gym
 */
export async function getAverageGymTime() {
  try {
    const { data, error } = await supabase
      .rpc('calculate_average_gym_time');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error calculating average gym time:', err);
    throw err;
  }
}

// ---- STATISTICS QUERIES ----

/**
 * Get member sign-up statistics by month
 */
export async function getMemberSignupsByMonth() {
  try {
    const { data, error } = await supabase
      .rpc('get_member_signups_by_month');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting member signups by month:', err);
    throw err;
  }
}

/**
 * Get gym usage statistics by day of week
 */
export async function getGymUsageByDayOfWeek() {
  try {
    const { data, error } = await supabase
      .rpc('get_gym_usage_by_day_of_week');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting gym usage by day:', err);
    throw err;
  }
}

/**
 * Get peak gym hours (busiest times)
 */
export async function getPeakGymHours() {
  try {
    const { data, error } = await supabase
      .rpc('get_peak_gym_hours');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting peak gym hours:', err);
    throw err;
  }
}

// ---- CUSTOM RPC FUNCTIONS ----
// Note: These RPCs need to be created in Supabase dashboard first

/**
 * Register a new member with default settings 
 */
export async function registerNewMember(memberData) {
  try {
    const { data, error } = await supabase
      .rpc('register_new_member', memberData);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error registering new member:', err);
    throw err;
  }
}

/**
 * Complete member check-in and check-out in one call
 */
export async function recordGymSession(memberId, durationMinutes) {
  try {
    const { data, error } = await supabase
      .rpc('record_gym_session', {
        member_id: memberId,
        duration_minutes: durationMinutes
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error recording gym session:', err);
    throw err;
  }
}

/**
 * Get member fitness stats 
 */
export async function getMemberFitnessStats(memberId) {
  try {
    const { data, error } = await supabase
      .rpc('get_member_fitness_stats', {
        member_id: memberId
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting member fitness stats:', err);
    throw err;
  }
} 