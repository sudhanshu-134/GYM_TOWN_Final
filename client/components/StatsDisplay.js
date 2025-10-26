import { useState, useEffect } from 'react';
import { 
  getMemberSignupsByMonth, 
  getGymUsageByDayOfWeek,
  getPeakGymHours,
  getAverageGymTime,
  getWorkoutsOrderedByCalories,
  getCurrentMembersInGym
} from '../utils/supabaseQueries';

function StatsDisplay() {
  const [activeTab, setActiveTab] = useState('signups');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    signups: [],
    usageByDay: [],
    peakHours: [],
    averageTime: null,
    topWorkouts: [],
    currentMembers: []
  });

  // Load data for the active tab
  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  // Load data based on the active tab
  const loadData = async (tab) => {
    setLoading(true);
    setError(null);

    try {
      switch (tab) {
        case 'signups':
          if (stats.signups.length === 0) {
            const data = await getMemberSignupsByMonth();
            setStats(prev => ({ ...prev, signups: data || [] }));
          }
          break;
        case 'usageByDay':
          if (stats.usageByDay.length === 0) {
            const data = await getGymUsageByDayOfWeek();
            setStats(prev => ({ ...prev, usageByDay: data || [] }));
          }
          break;
        case 'peakHours':
          if (stats.peakHours.length === 0) {
            const data = await getPeakGymHours();
            setStats(prev => ({ ...prev, peakHours: data || [] }));
          }
          break;
        case 'averageTime':
          if (stats.averageTime === null) {
            const data = await getAverageGymTime();
            setStats(prev => ({ ...prev, averageTime: data?.average_duration_minutes || 0 }));
          }
          break;
        case 'topWorkouts':
          if (stats.topWorkouts.length === 0) {
            const data = await getWorkoutsOrderedByCalories(10);
            setStats(prev => ({ ...prev, topWorkouts: data || [] }));
          }
          break;
        case 'currentMembers':
          // Always refresh current members data
          const data = await getCurrentMembersInGym();
          setStats(prev => ({ ...prev, currentMembers: data || [] }));
          break;
        default:
          break;
      }
    } catch (err) {
      setError(`Failed to load ${tab} data: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (!minutes) return '0 mins';
    
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hrs === 0) return `${mins} mins`;
    return `${hrs} hrs ${mins} mins`;
  };

  // Render chart for signups by month
  const renderSignupsChart = () => {
    const maxSignups = Math.max(...stats.signups.map(item => item.signup_count));
    
    return (
      <div className="chart signups-chart">
        <h3>Member Signups by Month</h3>
        {stats.signups.length === 0 ? (
          <p>No signup data available.</p>
        ) : (
          <div className="chart-content">
            {stats.signups.map((item, index) => (
              <div className="chart-bar" key={index}>
                <div className="bar-label">{`${item.month} ${item.year}`}</div>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${(item.signup_count / maxSignups) * 100}%` }}
                  ></div>
                  <span className="bar-value">{item.signup_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render chart for gym usage by day of week
  const renderUsageByDayChart = () => {
    const maxUsage = Math.max(...stats.usageByDay.map(item => item.check_in_count));
    
    // Sort days of week properly
    const sortedData = [...stats.usageByDay].sort((a, b) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days.indexOf(a.day_of_week.trim()) - days.indexOf(b.day_of_week.trim());
    });
    
    return (
      <div className="chart usage-chart">
        <h3>Gym Usage by Day of Week</h3>
        {sortedData.length === 0 ? (
          <p>No usage data available.</p>
        ) : (
          <div className="chart-content">
            {sortedData.map((item, index) => (
              <div className="chart-bar" key={index}>
                <div className="bar-label">{item.day_of_week.trim()}</div>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${(item.check_in_count / maxUsage) * 100}%` }}
                  ></div>
                  <span className="bar-value">{item.check_in_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render chart for peak gym hours
  const renderPeakHoursChart = () => {
    const maxCheckins = Math.max(...stats.peakHours.map(item => item.check_in_count));
    
    // Sort by hour_of_day
    const sortedData = [...stats.peakHours].sort((a, b) => a.hour_of_day - b.hour_of_day);
    
    return (
      <div className="chart peak-hours-chart">
        <h3>Peak Gym Hours</h3>
        {sortedData.length === 0 ? (
          <p>No peak hours data available.</p>
        ) : (
          <div className="chart-content">
            {sortedData.map((item, index) => (
              <div className="chart-bar" key={index}>
                <div className="bar-label">
                  {item.hour_of_day.toString().padStart(2, '0')}:00 - {(item.hour_of_day + 1).toString().padStart(2, '0')}:00
                </div>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${(item.check_in_count / maxCheckins) * 100}%` }}
                  ></div>
                  <span className="bar-value">{item.check_in_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render average gym time
  const renderAverageTime = () => {
    return (
      <div className="average-time-display">
        <h3>Average Gym Session Duration</h3>
        <div className="time-value">
          {formatDuration(stats.averageTime)}
        </div>
        <p className="description">
          This is the average time members spend at the gym per visit.
        </p>
      </div>
    );
  };

  // Render top workouts by calories burned
  const renderTopWorkouts = () => {
    return (
      <div className="top-workouts">
        <h3>Top Workouts by Calories Burned</h3>
        {stats.topWorkouts.length === 0 ? (
          <p>No workout data available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Workout</th>
                <th>Difficulty</th>
                <th>Duration</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {stats.topWorkouts.map((workout, index) => (
                <tr key={workout.id}>
                  <td>
                    <span className="rank">{index + 1}</span>
                    {workout.name}
                  </td>
                  <td>{workout.difficulty}</td>
                  <td>{workout.duration} mins</td>
                  <td>{workout.calories_burned} cal</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Render current members in gym
  const renderCurrentMembers = () => {
    return (
      <div className="current-members">
        <h3>Members Currently in Gym</h3>
        <div className="refresh-button">
          <button onClick={() => loadData('currentMembers')} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {stats.currentMembers.length === 0 ? (
          <p>No members currently in the gym.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Check-in Time</th>
                <th>Time in Gym</th>
              </tr>
            </thead>
            <tbody>
              {stats.currentMembers.map((record) => (
                <tr key={record.id}>
                  <td>{record.member_name}</td>
                  <td>{new Date(record.check_in_time).toLocaleTimeString()}</td>
                  <td>{formatDuration(Math.floor(record.time_in_gym / 60))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Render active tab content
  const renderTabContent = () => {
    if (loading) {
      return <div className="loading">Loading data...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (activeTab) {
      case 'signups':
        return renderSignupsChart();
      case 'usageByDay':
        return renderUsageByDayChart();
      case 'peakHours':
        return renderPeakHoursChart();
      case 'averageTime':
        return renderAverageTime();
      case 'topWorkouts':
        return renderTopWorkouts();
      case 'currentMembers':
        return renderCurrentMembers();
      default:
        return <div>Select a tab to view statistics</div>;
    }
  };

  return (
    <div className="stats-display">
      <h2>Gym Statistics Dashboard</h2>
      
      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={activeTab === 'signups' ? 'active' : ''}
          onClick={() => setActiveTab('signups')}
        >
          Member Signups
        </button>
        <button 
          className={activeTab === 'usageByDay' ? 'active' : ''}
          onClick={() => setActiveTab('usageByDay')}
        >
          Usage by Day
        </button>
        <button 
          className={activeTab === 'peakHours' ? 'active' : ''}
          onClick={() => setActiveTab('peakHours')}
        >
          Peak Hours
        </button>
        <button 
          className={activeTab === 'averageTime' ? 'active' : ''}
          onClick={() => setActiveTab('averageTime')}
        >
          Average Time
        </button>
        <button 
          className={activeTab === 'topWorkouts' ? 'active' : ''}
          onClick={() => setActiveTab('topWorkouts')}
        >
          Top Workouts
        </button>
        <button 
          className={activeTab === 'currentMembers' ? 'active' : ''}
          onClick={() => setActiveTab('currentMembers')}
        >
          Current Members
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
      
      <div className="data-source">
        <p>
          <strong>Data Source:</strong> All statistics are calculated using SQL queries on the Supabase database.
        </p>
      </div>
    </div>
  );
}

export default StatsDisplay;