import { useEffect, useState } from 'react';
import { fetchAll, fetchById, createItem, updateItem, deleteItem } from '../utils/supabase';

function WorkoutManager() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState({
    id: null,
    name: '',
    description: '',
    difficulty: 'beginner',
    duration: 30,
    calories_burned: 200
  });

  // Fetch all workouts on component mount
  useEffect(() => {
    loadWorkouts();
  }, []);

  // Load all workouts from Supabase
  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const data = await fetchAll('workouts');
      setWorkouts(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load workouts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric values
    if (name === 'duration' || name === 'calories_burned') {
      setCurrentWorkout(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setCurrentWorkout(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Create a new workout
  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newWorkout = await createItem('workouts', {
        name: currentWorkout.name,
        description: currentWorkout.description,
        difficulty: currentWorkout.difficulty,
        duration: currentWorkout.duration,
        calories_burned: currentWorkout.calories_burned
      });
      
      setWorkouts(prev => [...prev, newWorkout]);
      resetForm();
      setError(null);
    } catch (err) {
      setError('Failed to create workout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing workout
  const handleUpdateWorkout = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedWorkout = await updateItem('workouts', currentWorkout.id, {
        name: currentWorkout.name,
        description: currentWorkout.description,
        difficulty: currentWorkout.difficulty,
        duration: currentWorkout.duration,
        calories_burned: currentWorkout.calories_burned
      });
      
      setWorkouts(prev => 
        prev.map(workout => workout.id === currentWorkout.id ? updatedWorkout : workout)
      );
      resetForm();
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError('Failed to update workout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a workout
  const handleDeleteWorkout = async (id) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      setLoading(true);
      await deleteItem('workouts', id);
      setWorkouts(prev => prev.filter(workout => workout.id !== id));
      if (currentWorkout.id === id) {
        resetForm();
        setEditMode(false);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete workout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Set up form for editing
  const handleEdit = (workout) => {
    setCurrentWorkout({
      id: workout.id,
      name: workout.name,
      description: workout.description,
      difficulty: workout.difficulty,
      duration: workout.duration,
      calories_burned: workout.calories_burned
    });
    setEditMode(true);
  };

  // Reset form to default values
  const resetForm = () => {
    setCurrentWorkout({
      id: null,
      name: '',
      description: '',
      difficulty: 'beginner',
      duration: 30,
      calories_burned: 200
    });
  };

  // Cancel edit mode
  const handleCancel = () => {
    resetForm();
    setEditMode(false);
  };

  // View workout details
  const handleViewDetails = async (id) => {
    try {
      setLoading(true);
      const workout = await fetchById('workouts', id);
      alert(`Workout Details:\n
Name: ${workout.name}\n
Description: ${workout.description}\n
Difficulty: ${workout.difficulty}\n
Duration: ${workout.duration} minutes\n
Calories Burned: ${workout.calories_burned}`);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workout details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && workouts.length === 0) return <div>Loading workouts...</div>;

  return (
    <div className="workout-manager">
      <h2>Workout Manager</h2>
      
      {/* Workout Form */}
      <form onSubmit={editMode ? handleUpdateWorkout : handleCreateWorkout} className="workout-form">
        <h3>{editMode ? 'Edit Workout' : 'Create New Workout'}</h3>
        
        <div className="form-group">
          <label htmlFor="name">Workout Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={currentWorkout.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={currentWorkout.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty Level:</label>
          <select
            id="difficulty"
            name="difficulty"
            value={currentWorkout.difficulty}
            onChange={handleInputChange}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">Duration (minutes):</label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="5"
            max="180"
            value={currentWorkout.duration}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="calories_burned">Calories Burned:</label>
          <input
            type="number"
            id="calories_burned"
            name="calories_burned"
            min="10"
            max="1000"
            value={currentWorkout.calories_burned}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : editMode ? 'Update Workout' : 'Create Workout'}
          </button>
          
          {editMode && (
            <button type="button" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Workouts List */}
      <div className="workouts-list">
        <h3>Available Workouts ({workouts.length})</h3>
        
        {workouts.length === 0 ? (
          <p>No workouts found. Create your first workout!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Difficulty</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map(workout => (
                <tr key={workout.id}>
                  <td>{workout.name}</td>
                  <td>{workout.difficulty}</td>
                  <td>{workout.duration} mins</td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleViewDetails(workout.id)}
                      disabled={loading}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEdit(workout)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteWorkout(workout.id)}
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
    </div>
  );
}

export default WorkoutManager; 