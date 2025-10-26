// Client-side Supabase integration

// Import the Supabase client constructor
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://uyeysqwrhyufyoqahcph.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZXlzcXdyaHl1ZnlvcWFoY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODQzNDksImV4cCI6MjA2MTA2MDM0OX0.E1GD9UqH6ty3xBt0OWPy_-Hefb8xInXl0316cAS8TOQ';

// Create Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

// Example functions for common Supabase operations

// Fetch all items from a table
export async function fetchAll(table) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Fetch a single item by ID
export async function fetchById(table, id) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
}

// Create a new item
export async function createItem(table, item) {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(item)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

// Update an existing item
export async function updateItem(table, id, updates) {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

// Delete an item
export async function deleteItem(table, id) {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

// Export the Supabase client for direct use
export { supabase }; 