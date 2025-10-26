import { useEffect, useState } from 'react';
import { fetchAll, createItem, updateItem, deleteItem } from '../utils/supabase';

function DietPlanManager() {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    id: null,
    name: '',
    description: '',
    calories: 2000,
    protein: 100,
    carbs: 200,
    fat: 70
  });

  // Load all diet plans on component mount
  useEffect(() => {
    loadDietPlans();
  }, []);

  // Fetch diet plans from Supabase
  const loadDietPlans = async () => {
    try {
      setLoading(true);
      const data = await fetchAll('diet_plans');
      setDietPlans(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load diet plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric values
    if (['calories', 'protein', 'carbs', 'fat'].includes(name)) {
      setCurrentPlan(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setCurrentPlan(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Create a new diet plan
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newPlan = await createItem('diet_plans', {
        name: currentPlan.name,
        description: currentPlan.description,
        calories: currentPlan.calories,
        protein: currentPlan.protein,
        carbs: currentPlan.carbs,
        fat: currentPlan.fat
      });
      
      setDietPlans(prev => [...prev, newPlan]);
      resetForm();
      setError(null);
    } catch (err) {
      setError('Failed to create diet plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing diet plan
  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedPlan = await updateItem('diet_plans', currentPlan.id, {
        name: currentPlan.name,
        description: currentPlan.description,
        calories: currentPlan.calories,
        protein: currentPlan.protein,
        carbs: currentPlan.carbs,
        fat: currentPlan.fat
      });
      
      setDietPlans(prev => 
        prev.map(plan => plan.id === currentPlan.id ? updatedPlan : plan)
      );
      resetForm();
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError('Failed to update diet plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a diet plan
  const handleDeletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    
    try {
      setLoading(true);
      await deleteItem('diet_plans', id);
      setDietPlans(prev => prev.filter(plan => plan.id !== id));
      if (currentPlan.id === id) {
        resetForm();
        setEditMode(false);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete diet plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Set up form for editing
  const handleEdit = (plan) => {
    setCurrentPlan({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      calories: plan.calories,
      protein: plan.protein,
      carbs: plan.carbs,
      fat: plan.fat
    });
    setEditMode(true);
  };

  // Reset form to default values
  const resetForm = () => {
    setCurrentPlan({
      id: null,
      name: '',
      description: '',
      calories: 2000,
      protein: 100,
      carbs: 200,
      fat: 70
    });
  };

  // Cancel edit mode
  const handleCancel = () => {
    resetForm();
    setEditMode(false);
  };

  if (loading && dietPlans.length === 0) return <div>Loading diet plans...</div>;

  return (
    <div className="diet-plan-manager">
      <h2>Diet Plan Manager</h2>
      
      {/* Diet Plan Form */}
      <form onSubmit={editMode ? handleUpdatePlan : handleCreatePlan} className="diet-plan-form">
        <h3>{editMode ? 'Edit Diet Plan' : 'Create New Diet Plan'}</h3>
        
        <div className="form-group">
          <label htmlFor="name">Plan Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={currentPlan.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={currentPlan.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="calories">Calories (kcal):</label>
          <input
            type="number"
            id="calories"
            name="calories"
            min="500"
            max="5000"
            value={currentPlan.calories}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="protein">Protein (g):</label>
          <input
            type="number"
            id="protein"
            name="protein"
            min="10"
            max="300"
            value={currentPlan.protein}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="carbs">Carbohydrates (g):</label>
          <input
            type="number"
            id="carbs"
            name="carbs"
            min="20"
            max="500"
            value={currentPlan.carbs}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fat">Fat (g):</label>
          <input
            type="number"
            id="fat"
            name="fat"
            min="10"
            max="200"
            value={currentPlan.fat}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : editMode ? 'Update Plan' : 'Create Plan'}
          </button>
          
          {editMode && (
            <button type="button" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Diet Plans List */}
      <div className="diet-plans-list">
        <h3>Available Diet Plans ({dietPlans.length})</h3>
        
        {dietPlans.length === 0 ? (
          <p>No diet plans found. Create your first diet plan!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Calories</th>
                <th>Macros (P/C/F)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dietPlans.map(plan => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.calories} kcal</td>
                  <td>{plan.protein}g / {plan.carbs}g / {plan.fat}g</td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleEdit(plan)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeletePlan(plan.id)}
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
      
      {/* Nutritional Info */}
      <div className="nutritional-info">
        <h3>Nutritional Information</h3>
        <p>
          Our diet plans are designed to support your fitness goals. The macronutrient ratios are carefully calculated
          based on proven nutritional science to ensure optimal results.
        </p>
        <ul>
          <li><strong>Protein:</strong> Essential for muscle repair and growth</li>
          <li><strong>Carbohydrates:</strong> Provide energy for workouts and daily activities</li>
          <li><strong>Fats:</strong> Support hormone production and nutrient absorption</li>
        </ul>
      </div>
    </div>
  );
}

export default DietPlanManager; 