import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAll, fetchById, createItem, updateItem, deleteItem } from './supabase';

/**
 * Custom hook to fetch all records from a Supabase table
 * @param {string} table - Table name
 * @param {object} options - Query options
 * @returns {object} - { data, error, loading, refetch }
 */
export function useSupabaseQuery(table, options = {}) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { orderBy, filters, limit } = options;

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from(table).select('*');
      
      // Apply ordering if specified
      if (orderBy) {
        const { column, ascending = true } = orderBy;
        query = query.order(column, { ascending });
      }
      
      // Apply filters if any
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          const { column, operator, value } = filter;
          query = query[operator](column, value);
        });
      }
      
      // Apply limit if specified
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: responseData, error: responseError } = await query;
      
      if (responseError) throw responseError;
      
      setData(responseData || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}

/**
 * Custom hook to perform CRUD operations on a Supabase table
 * @param {string} table - Table name
 * @returns {object} - CRUD methods and state
 */
export function useSupabaseCrud(table) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Create a new record
  const create = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createItem(table, data);
      return result;
    } catch (err) {
      setError(`Error creating record: ${err.message}`);
      console.error('Error creating record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Read a record by ID
  const read = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchById(table, id);
      return result;
    } catch (err) {
      setError(`Error reading record: ${err.message}`);
      console.error('Error reading record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Read all records
  const readAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAll(table);
      return result;
    } catch (err) {
      setError(`Error reading records: ${err.message}`);
      console.error('Error reading records:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Update a record
  const update = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateItem(table, id, data);
      return result;
    } catch (err) {
      setError(`Error updating record: ${err.message}`);
      console.error('Error updating record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a record
  const remove = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteItem(table, id);
      return result;
    } catch (err) {
      setError(`Error deleting record: ${err.message}`);
      console.error('Error deleting record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    create,
    read,
    readAll,
    update,
    remove,
    loading,
    error
  };
}

/**
 * Custom hook for real-time subscriptions to Supabase tables
 * @param {string} table - Table name
 * @param {object} options - Subscription options
 * @returns {object} - { data, error }
 */
export function useSupabaseSubscription(table, options = {}) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  
  const { event = '*', filter } = options;
  
  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        let query = supabase.from(table).select('*');
        
        if (filter) {
          const { column, value } = filter;
          query = query.eq(column, value);
        }
        
        const { data: initialData, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        setData(initialData || []);
      } catch (err) {
        setError(`Error fetching initial data: ${err.message}`);
        console.error('Error fetching initial data:', err);
      }
    };
    
    fetchInitialData();
    
    // Set up real-time subscription
    let subscription = supabase
      .channel(`table-changes:${table}`)
      .on('postgres_changes', {
        event,
        schema: 'public',
        table
      }, (payload) => {
        // Handle different event types
        if (payload.eventType === 'INSERT') {
          setData(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => 
            prev.map(item => item.id === payload.new.id ? payload.new : item)
          );
        } else if (payload.eventType === 'DELETE') {
          setData(prev => 
            prev.filter(item => item.id !== payload.old.id)
          );
        }
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          setError(`Subscription status: ${status}`);
        }
      });
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [table, JSON.stringify(options)]);
  
  return { data, error };
}

/**
 * Custom hook for handling form state with Supabase
 * @param {string} table - Table name
 * @param {object} initialData - Initial form data
 * @returns {object} - Form state and handlers
 */
export function useSupabaseForm(table, initialData = {}) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { create, update } = useSupabaseCrud(table);
  
  // Reset form to initial state or new state
  const resetForm = (newInitialData = initialData) => {
    setFormData(newInitialData);
    setError(null);
    setSuccess(false);
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    // Clear error when user starts typing again
    setError(null);
    setSuccess(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      let result;
      
      if (formData.id) {
        // Update existing record
        result = await update(formData.id, formData);
      } else {
        // Create new record
        result = await create(formData);
      }
      
      setSuccess(true);
      return result;
    } catch (err) {
      setError(`Form submission error: ${err.message}`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    resetForm,
    loading,
    error,
    success
  };
}

// Export the Supabase utility functions as well
export { fetchAll, fetchById, createItem, updateItem, deleteItem }; 