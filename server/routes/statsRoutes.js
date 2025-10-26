const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');
const pool = require('../config/db');
const supabase = require('../config/supabase');

// Test route - No authentication required
router.get('/test', (req, res) => {
  res.json({ message: 'Stats routes are working!' });
});

// Test database connection with more detailed error reporting
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Use the mock pool implementation
    const result = await pool.query('SELECT NOW() as time');
    
    res.json({ 
      message: 'Mock database connection successful!',
      time: result.rows[0]?.time,
      note: 'Using Supabase REST API instead of direct PostgreSQL connection',
      connectionInfo: {
        type: 'mock',
        direct_pg_connection: false,
        supabase_client: true
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      message: error.message,
      code: error.code,
      details: error.stack
    });
  }
});

// Test Supabase connection - No authentication required
router.get('/test-supabase', async (req, res) => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', process.env.url);
    console.log('API Key length:', process.env.api_key ? process.env.api_key.length : 'undefined');
    
    // Try simple query with Supabase
    const { data, error } = await supabase
      .from('members')
      .select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    console.log('Supabase query result:', data);
    
    res.json({
      message: 'Supabase connection successful!',
      count: data || 0,
      supabaseUrl: process.env.url
    });
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    res.status(500).json({
      error: 'Supabase connection failed',
      message: error.message || 'Unknown error',
      code: error.code,
      details: error.stack,
      supabaseConfig: {
        url: process.env.url && process.env.url.substring(0, 10) + '...' // Don't expose full URL
      }
    });
  }
});

// Stats routes - All routes require authentication
router.get('/signups', auth, statsController.getMemberSignupsByMonth);
router.get('/usage-by-day', auth, statsController.getGymUsageByDayOfWeek);
router.get('/peak-hours', auth, statsController.getPeakGymHours);
router.get('/average-time', auth, statsController.getAverageGymTime);
router.get('/top-workouts', auth, statsController.getTopWorkouts);
router.get('/current-members', auth, statsController.getCurrentMembersInGym);
router.get('/retention-rate', auth, statsController.getMemberRetentionRate);
router.get('/attendance-frequency', auth, statsController.getMemberAttendanceFrequency);
router.get('/all', auth, statsController.getAllStats);

// Check environment variables
router.get('/check-env', (req, res) => {
  res.json({
    supabaseUrl: process.env.url || 'Not set',
    apiKeyLength: process.env.api_key ? process.env.api_key.length : 'Not set',
    nodeEnv: process.env.NODE_ENV || 'Not set',
    port: process.env.PORT || 'Not set'
  });
});

module.exports = router;