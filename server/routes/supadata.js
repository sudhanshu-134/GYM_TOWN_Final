const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all data from a table
router.get('/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});

// Get a specific item by id
router.get('/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});

// Create a new item
router.post('/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { data, error } = await supabase
      .from(table)
      .insert(req.body)
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ message: 'Error creating data', error: error.message });
  }
});

// Update an item
router.put('/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const { data, error } = await supabase
      .from(table)
      .update(req.body)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(data[0]);
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

// Delete an item
router.delete('/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});

module.exports = router; 