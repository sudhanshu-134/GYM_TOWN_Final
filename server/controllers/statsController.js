// Use Supabase client instead of direct PostgreSQL connection
const supabase = require('../config/supabase');

/**
 * Get member signups by month
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemberSignupsByMonth = async (req, res) => {
  try {
    // Using mock data since we can't connect directly to the database
    const mockData = [
      { month: '2025-01', count: 24 },
      { month: '2025-02', count: 36 },
      { month: '2025-03', count: 42 },
      { month: '2025-04', count: 51 },
      { month: '2025-05', count: 30 }
    ];
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getMemberSignupsByMonth:', error);
    res.status(500).json({ error: 'Failed to retrieve member signup statistics' });
  }
};

/**
 * Get gym usage by day of week
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGymUsageByDayOfWeek = async (req, res) => {
  try {
    // Using mock data
    const mockData = [
      { day_of_week: 0, day_name: 'Sunday', total_visits: 145, unique_members: 78 },
      { day_of_week: 1, day_name: 'Monday', total_visits: 210, unique_members: 120 },
      { day_of_week: 2, day_name: 'Tuesday', total_visits: 189, unique_members: 105 },
      { day_of_week: 3, day_name: 'Wednesday', total_visits: 201, unique_members: 115 },
      { day_of_week: 4, day_name: 'Thursday', total_visits: 187, unique_members: 103 },
      { day_of_week: 5, day_name: 'Friday', total_visits: 164, unique_members: 98 },
      { day_of_week: 6, day_name: 'Saturday', total_visits: 156, unique_members: 89 }
    ];
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getGymUsageByDayOfWeek:', error);
    res.status(500).json({ error: 'Failed to retrieve gym usage statistics' });
  }
};

/**
 * Get peak gym hours
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPeakGymHours = async (req, res) => {
  try {
    // Using mock data
    const mockData = [
      { hour_of_day: 18, check_ins: 245 }, // 6 PM
      { hour_of_day: 17, check_ins: 231 }, // 5 PM
      { hour_of_day: 7, check_ins: 187 },  // 7 AM
      { hour_of_day: 19, check_ins: 176 }, // 7 PM
      { hour_of_day: 8, check_ins: 165 },  // 8 AM
      { hour_of_day: 16, check_ins: 158 }, // 4 PM
      { hour_of_day: 12, check_ins: 134 }, // 12 PM
      { hour_of_day: 6, check_ins: 112 }   // 6 AM
    ];
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getPeakGymHours:', error);
    res.status(500).json({ error: 'Failed to retrieve peak gym hours' });
  }
};

/**
 * Get average gym time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAverageGymTime = async (req, res) => {
  try {
    // Using mock data
    const mockData = { avg_minutes: 72.5 };
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getAverageGymTime:', error);
    res.status(500).json({ error: 'Failed to retrieve average gym time' });
  }
};

/**
 * Get top workouts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTopWorkouts = async (req, res) => {
  try {
    // Using mock data
    const mockData = [
      { workout_name: 'HIIT Circuit', avg_calories: 520, member_count: 87 },
      { workout_name: 'Powerlifting', avg_calories: 480, member_count: 65 },
      { workout_name: 'CrossFit WOD', avg_calories: 450, member_count: 92 },
      { workout_name: 'Spin Class', avg_calories: 410, member_count: 78 },
      { workout_name: 'Bootcamp', avg_calories: 390, member_count: 56 },
      { workout_name: 'Boxing', avg_calories: 370, member_count: 43 },
      { workout_name: 'Bodybuilding', avg_calories: 340, member_count: 38 },
      { workout_name: 'Yoga Flow', avg_calories: 220, member_count: 65 }
    ];
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getTopWorkouts:', error);
    res.status(500).json({ error: 'Failed to retrieve top workouts' });
  }
};

/**
 * Get current members in gym
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentMembersInGym = async (req, res) => {
  try {
    // Using mock data
    const mockData = [
      { id: '123e4567-e89b-12d3-a456-426614174000', name: 'John Smith', check_in_time: new Date(Date.now() - 120 * 60000).toISOString(), minutes_in_gym: 120 },
      { id: '223e4567-e89b-12d3-a456-426614174001', name: 'Sarah Johnson', check_in_time: new Date(Date.now() - 90 * 60000).toISOString(), minutes_in_gym: 90 },
      { id: '323e4567-e89b-12d3-a456-426614174002', name: 'Michael Brown', check_in_time: new Date(Date.now() - 60 * 60000).toISOString(), minutes_in_gym: 60 },
      { id: '423e4567-e89b-12d3-a456-426614174003', name: 'Emily Davis', check_in_time: new Date(Date.now() - 45 * 60000).toISOString(), minutes_in_gym: 45 },
      { id: '523e4567-e89b-12d3-a456-426614174004', name: 'David Wilson', check_in_time: new Date(Date.now() - 30 * 60000).toISOString(), minutes_in_gym: 30 },
      { id: '623e4567-e89b-12d3-a456-426614174005', name: 'Jessica Lee', check_in_time: new Date(Date.now() - 15 * 60000).toISOString(), minutes_in_gym: 15 }
    ];
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getCurrentMembersInGym:', error);
    res.status(500).json({ error: 'Failed to retrieve current members in gym' });
  }
};

/**
 * Get member retention rate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemberRetentionRate = async (req, res) => {
  try {
    // Using mock data
    const mockData = {
      active_count: 342,
      total_count: 412,
      retention_rate: 83.01
    };
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getMemberRetentionRate:', error);
    res.status(500).json({ error: 'Failed to retrieve member retention rate' });
  }
};

/**
 * Get member attendance frequency
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemberAttendanceFrequency = async (req, res) => {
  try {
    // Using mock data
    const mockData = [
      { frequency_group: '5+ times per week', member_count: 87 },
      { frequency_group: '3-4 times per week', member_count: 156 },
      { frequency_group: '1-2 times per week', member_count: 245 },
      { frequency_group: 'Less than once a week', member_count: 124 }
    ];
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in getMemberAttendanceFrequency:', error);
    res.status(500).json({ error: 'Failed to retrieve member attendance frequency' });
  }
};

/**
 * Get all stats in a single request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStats = async (req, res) => {
  try {
    // Get all the mock data
    const signupsByMonth = [
      { month: '2025-01', count: 24 },
      { month: '2025-02', count: 36 },
      { month: '2025-03', count: 42 },
      { month: '2025-04', count: 51 },
      { month: '2025-05', count: 30 }
    ];
    
    const usageByDayOfWeek = [
      { day_of_week: 0, day_name: 'Sunday', total_visits: 145, unique_members: 78 },
      { day_of_week: 1, day_name: 'Monday', total_visits: 210, unique_members: 120 },
      { day_of_week: 2, day_name: 'Tuesday', total_visits: 189, unique_members: 105 },
      { day_of_week: 3, day_name: 'Wednesday', total_visits: 201, unique_members: 115 },
      { day_of_week: 4, day_name: 'Thursday', total_visits: 187, unique_members: 103 },
      { day_of_week: 5, day_name: 'Friday', total_visits: 164, unique_members: 98 },
      { day_of_week: 6, day_name: 'Saturday', total_visits: 156, unique_members: 89 }
    ];
    
    const peakHours = [
      { hour_of_day: 18, check_ins: 245 },
      { hour_of_day: 17, check_ins: 231 },
      { hour_of_day: 7, check_ins: 187 },
      { hour_of_day: 19, check_ins: 176 },
      { hour_of_day: 8, check_ins: 165 },
      { hour_of_day: 16, check_ins: 158 },
      { hour_of_day: 12, check_ins: 134 },
      { hour_of_day: 6, check_ins: 112 }
    ];
    
    const averageTime = { avg_minutes: 72.5 };
    
    const topWorkouts = [
      { workout_name: 'HIIT Circuit', avg_calories: 520, member_count: 87 },
      { workout_name: 'Powerlifting', avg_calories: 480, member_count: 65 },
      { workout_name: 'CrossFit WOD', avg_calories: 450, member_count: 92 },
      { workout_name: 'Spin Class', avg_calories: 410, member_count: 78 },
      { workout_name: 'Bootcamp', avg_calories: 390, member_count: 56 }
    ];
    
    const currentMembers = [
      { id: '123e4567-e89b-12d3-a456-426614174000', name: 'John Smith', check_in_time: new Date(Date.now() - 120 * 60000).toISOString(), minutes_in_gym: 120 },
      { id: '223e4567-e89b-12d3-a456-426614174001', name: 'Sarah Johnson', check_in_time: new Date(Date.now() - 90 * 60000).toISOString(), minutes_in_gym: 90 }
    ];
    
    const retentionRate = {
      active_count: 342,
      total_count: 412,
      retention_rate: 83.01
    };
    
    const attendanceFrequency = [
      { frequency_group: '5+ times per week', member_count: 87 },
      { frequency_group: '3-4 times per week', member_count: 156 },
      { frequency_group: '1-2 times per week', member_count: 245 },
      { frequency_group: 'Less than once a week', member_count: 124 }
    ];
    
    res.json({
      signupsByMonth,
      usageByDayOfWeek,
      peakHours,
      averageTime,
      topWorkouts,
      currentMembers,
      retentionRate,
      attendanceFrequency,
      note: 'Using mock data since direct database connection is not available'
    });
  } catch (error) {
    console.error('Error in getAllStats:', error);
    res.status(500).json({ error: 'Failed to retrieve gym statistics' });
  }
};

module.exports = {
  getMemberSignupsByMonth,
  getGymUsageByDayOfWeek,
  getPeakGymHours,
  getAverageGymTime,
  getTopWorkouts,
  getCurrentMembersInGym,
  getMemberRetentionRate,
  getMemberAttendanceFrequency,
  getAllStats
}; 