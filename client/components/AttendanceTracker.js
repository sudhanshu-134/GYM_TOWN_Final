import { useEffect, useState } from 'react';
import { fetchAll, createItem, fetchById, deleteItem } from '../utils/supabase';

function AttendanceTracker() {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'history'
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Load data on component mount
  useEffect(() => {
    Promise.all([loadMembers(), loadAttendance()]);
  }, []);

  // Load members from Supabase
  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await fetchAll('members');
      setMembers(data || []);
      return data;
    } catch (err) {
      setError('Failed to load members');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load attendance records from Supabase
  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await fetchAll('attendance');
      
      // Sort attendance records by check_in_time (newest first)
      const sortedData = data ? [...data].sort((a, b) => 
        new Date(b.check_in_time) - new Date(a.check_in_time)
      ) : [];
      
      setAttendance(sortedData);
      return sortedData;
    } catch (err) {
      setError('Failed to load attendance records');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Record check-in for a member
  const handleCheckIn = async () => {
    if (!selectedMember) {
      setError('Please select a member');
      return;
    }

    try {
      setLoading(true);
      const checkInTime = new Date().toISOString();
      
      // Get the selected member's details
      const member = await fetchById('members', selectedMember);
      
      // Create a new attendance record
      const newAttendance = await createItem('attendance', {
        member_id: selectedMember,
        member_name: member.name, // Store name for easier display
        check_in_time: checkInTime,
        check_out_time: null
      });
      
      setAttendance(prev => [newAttendance, ...prev]);
      setSelectedMember('');
      setError(null);
    } catch (err) {
      setError('Failed to record check-in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Record check-out for a member
  const handleCheckOut = async (attendanceId) => {
    try {
      setLoading(true);
      const checkOutTime = new Date().toISOString();
      
      // Find the attendance record
      const record = attendance.find(a => a.id === attendanceId);
      
      // Update the attendance record with check-out time
      const updatedAttendance = await createItem('attendance', {
        id: attendanceId,
        member_id: record.member_id,
        member_name: record.member_name,
        check_in_time: record.check_in_time,
        check_out_time: checkOutTime
      });
      
      // Update the local state
      setAttendance(prev => 
        prev.map(a => a.id === attendanceId ? 
          { ...a, check_out_time: checkOutTime } : a
        )
      );
      
      setError(null);
    } catch (err) {
      setError('Failed to record check-out');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete an attendance record
  const handleDeleteRecord = async (id) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    
    try {
      setLoading(true);
      await deleteItem('attendance', id);
      setAttendance(prev => prev.filter(record => record.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete attendance record');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Calculate duration between check-in and check-out
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkOut) return 'Still in gym';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Filter attendance records based on current view mode
  const getFilteredAttendance = () => {
    if (viewMode === 'daily') {
      // Filter by the selected date
      return attendance.filter(record => {
        const recordDate = new Date(record.check_in_time).toISOString().split('T')[0];
        return recordDate === dateFilter;
      });
    } else {
      // Return all records for the history view
      return attendance;
    }
  };

  if (loading && members.length === 0 && attendance.length === 0) {
    return <div>Loading attendance data...</div>;
  }

  return (
    <div className="attendance-tracker">
      <h2>Attendance Tracker</h2>
      
      {/* Check-in Form */}
      <div className="check-in-form">
        <h3>Member Check-in</h3>
        <div className="form-group">
          <label htmlFor="member">Select Member:</label>
          <select
            id="member"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select a member --</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleCheckIn} 
          disabled={!selectedMember || loading}
        >
          Check In
        </button>
      </div>

      {/* View Controls */}
      <div className="view-controls">
        <div className="view-toggle">
          <button 
            className={viewMode === 'daily' ? 'active' : ''}
            onClick={() => setViewMode('daily')}
          >
            Daily View
          </button>
          <button 
            className={viewMode === 'history' ? 'active' : ''}
            onClick={() => setViewMode('history')}
          >
            History
          </button>
        </div>
        
        {viewMode === 'daily' && (
          <div className="date-filter">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Attendance Records */}
      <div className="attendance-records">
        <h3>
          {viewMode === 'daily' ? 
            `Attendance for ${new Date(dateFilter).toLocaleDateString()}` : 
            'Attendance History'
          }
        </h3>
        
        {getFilteredAttendance().length === 0 ? (
          <p>No attendance records found for this period.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Check-in Time</th>
                <th>Check-out Time</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAttendance().map(record => (
                <tr key={record.id}>
                  <td>{record.member_name}</td>
                  <td>{formatDate(record.check_in_time)}</td>
                  <td>
                    {record.check_out_time ? 
                      formatDate(record.check_out_time) : 
                      <button 
                        onClick={() => handleCheckOut(record.id)}
                        disabled={loading}
                      >
                        Check Out
                      </button>
                    }
                  </td>
                  <td>{calculateDuration(record.check_in_time, record.check_out_time)}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteRecord(record.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Statistics */}
      <div className="attendance-stats">
        <h3>Attendance Statistics</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-value">{attendance.length}</span>
            <span className="stat-label">Total Check-ins</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">
              {attendance.filter(r => !r.check_out_time).length}
            </span>
            <span className="stat-label">Currently in Gym</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">
              {getFilteredAttendance().length}
            </span>
            <span className="stat-label">
              {viewMode === 'daily' ? 'Today\'s Check-ins' : 'Shown Records'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceTracker; 