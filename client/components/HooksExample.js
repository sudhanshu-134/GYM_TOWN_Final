import { useState } from 'react';
import { 
  useSupabaseQuery, 
  useSupabaseCrud,
  useSupabaseForm,
  useSupabaseSubscription
} from '../utils/supabaseHooks';

function HooksExample() {
  const [activeTab, setActiveTab] = useState('query');
  
  return (
    <div className="hooks-example">
      <h2>Supabase Hooks Examples</h2>
      
      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={activeTab === 'query' ? 'active' : ''}
          onClick={() => setActiveTab('query')}
        >
          useSupabaseQuery
        </button>
        <button 
          className={activeTab === 'crud' ? 'active' : ''}
          onClick={() => setActiveTab('crud')}
        >
          useSupabaseCrud
        </button>
        <button 
          className={activeTab === 'form' ? 'active' : ''}
          onClick={() => setActiveTab('form')}
        >
          useSupabaseForm
        </button>
        <button 
          className={activeTab === 'subscription' ? 'active' : ''}
          onClick={() => setActiveTab('subscription')}
        >
          useSupabaseSubscription
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'query' && <QueryExample />}
        {activeTab === 'crud' && <CrudExample />}
        {activeTab === 'form' && <FormExample />}
        {activeTab === 'subscription' && <SubscriptionExample />}
      </div>
    </div>
  );
}

// Example using useSupabaseQuery
function QueryExample() {
  const [tableName, setTableName] = useState('members');
  const [orderColumn, setOrderColumn] = useState('name');
  const [isAscending, setIsAscending] = useState(true);
  const [limit, setLimit] = useState(10);
  
  // Setting up the query options
  const queryOptions = {
    orderBy: {
      column: orderColumn,
      ascending: isAscending
    },
    limit: parseInt(limit) || 10
  };
  
  // Using the useSupabaseQuery hook
  const { data, error, loading, refetch } = useSupabaseQuery(tableName, queryOptions);
  
  return (
    <div className="query-example">
      <h3>useSupabaseQuery Example</h3>
      
      <div className="query-controls">
        <div className="form-group">
          <label htmlFor="table">Table Name:</label>
          <select 
            id="table"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          >
            <option value="members">Members</option>
            <option value="workouts">Workouts</option>
            <option value="diet_plans">Diet Plans</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="orderColumn">Order By:</label>
          <input
            type="text"
            id="orderColumn"
            value={orderColumn}
            onChange={(e) => setOrderColumn(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>
            <input 
              type="checkbox"
              checked={isAscending}
              onChange={(e) => setIsAscending(e.target.checked)}
            />
            Ascending Order
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="limit">Limit:</label>
          <input
            type="number"
            id="limit"
            min="1"
            max="100"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>
        
        <button onClick={refetch} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="results">
        <h4>Results: {data.length} items</h4>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}

// Example using useSupabaseCrud
function CrudExample() {
  const [tableName, setTableName] = useState('workouts');
  const [itemId, setItemId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [result, setResult] = useState(null);
  
  // Using the useSupabaseCrud hook
  const { create, read, readAll, update, remove, loading, error } = useSupabaseCrud(tableName);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // CRUD operations
  const handleReadAll = async () => {
    try {
      const data = await readAll();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const handleRead = async () => {
    if (!itemId) return;
    try {
      const data = await read(itemId);
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const handleCreate = async () => {
    try {
      const data = await create(formData);
      setResult(data);
      setFormData({
        name: '',
        description: ''
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const handleUpdate = async () => {
    if (!itemId) return;
    try {
      const data = await update(itemId, formData);
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const handleDelete = async () => {
    if (!itemId) return;
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const success = await remove(itemId);
      setResult({ success, message: 'Item deleted successfully' });
      setItemId('');
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return (
    <div className="crud-example">
      <h3>useSupabaseCrud Example</h3>
      
      <div className="crud-controls">
        <div className="form-group">
          <label htmlFor="crudTable">Table Name:</label>
          <select 
            id="crudTable"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          >
            <option value="members">Members</option>
            <option value="workouts">Workouts</option>
            <option value="diet_plans">Diet Plans</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="itemId">Item ID (for read, update, delete):</label>
          <input
            type="text"
            id="itemId"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>
        
        <div className="button-group">
          <button onClick={handleReadAll} disabled={loading}>Read All</button>
          <button onClick={handleRead} disabled={loading || !itemId}>Read</button>
          <button onClick={handleCreate} disabled={loading || !formData.name}>Create</button>
          <button onClick={handleUpdate} disabled={loading || !itemId || !formData.name}>Update</button>
          <button onClick={handleDelete} disabled={loading || !itemId}>Delete</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      
      {result && (
        <div className="results">
          <h4>Operation Result:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// Example using useSupabaseForm
function FormExample() {
  const [tableName, setTableName] = useState('diet_plans');
  
  // Using the useSupabaseForm hook
  const {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    resetForm,
    loading,
    error,
    success
  } = useSupabaseForm(tableName, {
    name: '',
    description: '',
    calories: 2000,
    protein: 100,
    carbs: 200,
    fat: 70
  });
  
  // Handle form submission wrapped around the hook's handleSubmit
  const onSubmit = async (e) => {
    const result = await handleSubmit(e);
    if (result) {
      console.log('Form submitted successfully', result);
      resetForm(); // Reset form on success
    }
  };
  
  return (
    <div className="form-example">
      <h3>useSupabaseForm Example</h3>
      
      <div className="form-controls">
        <div className="form-group">
          <label htmlFor="formTable">Table Name:</label>
          <select 
            id="formTable"
            value={tableName}
            onChange={(e) => {
              setTableName(e.target.value);
              resetForm(); // Reset form when table changes
            }}
          >
            <option value="members">Members</option>
            <option value="workouts">Workouts</option>
            <option value="diet_plans">Diet Plans</option>
          </select>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="formName">Name:</label>
            <input
              type="text"
              id="formName"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="formDescription">Description:</label>
            <textarea
              id="formDescription"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          {tableName === 'diet_plans' && (
            <>
              <div className="form-group">
                <label htmlFor="formCalories">Calories:</label>
                <input
                  type="number"
                  id="formCalories"
                  name="calories"
                  value={formData.calories || 2000}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="formProtein">Protein (g):</label>
                <input
                  type="number"
                  id="formProtein"
                  name="protein"
                  value={formData.protein || 100}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="formCarbs">Carbs (g):</label>
                <input
                  type="number"
                  id="formCarbs"
                  name="carbs"
                  value={formData.carbs || 200}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="formFat">Fat (g):</label>
                <input
                  type="number"
                  id="formFat"
                  name="fat"
                  value={formData.fat || 70}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          
          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : formData.id ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => resetForm()} disabled={loading}>
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Operation completed successfully!</div>}
    </div>
  );
}

// Example using useSupabaseSubscription
function SubscriptionExample() {
  const [tableName, setTableName] = useState('attendance');
  
  // Using the useSupabaseSubscription hook
  const { data, error } = useSupabaseSubscription(tableName);
  
  return (
    <div className="subscription-example">
      <h3>useSupabaseSubscription Example</h3>
      <p>This component demonstrates real-time data subscriptions with Supabase.</p>
      <p>Any changes made to the selected table will automatically appear here.</p>
      
      <div className="subscription-controls">
        <div className="form-group">
          <label htmlFor="subscriptionTable">Table Name:</label>
          <select 
            id="subscriptionTable"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          >
            <option value="members">Members</option>
            <option value="workouts">Workouts</option>
            <option value="diet_plans">Diet Plans</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="results">
        <h4>Real-time Data: {data.length} items</h4>
        <div className="subscription-data">
          {data.length > 0 ? (
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id || index}>
                    {Object.values(item).map((value, i) => (
                      <td key={i}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available. Try adding some records to the table.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HooksExample; 