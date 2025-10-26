const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    // Return user without password
    const user = req.user.toObject();
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['fullName', 'email', 'currentWeight', 'goalWeight', 'dietPlan', 'fitnessGoals'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    
    const user = req.user.toObject();
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user profile', error: error.message });
  }
});

module.exports = router; 