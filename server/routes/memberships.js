const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all membership plans
router.get('/plans', (req, res) => {
    const plans = [
        {
            name: 'Basic',
            price: 29.99,
            features: [
                'Access to gym equipment',
                'Basic workout plans',
                'Locker room access',
                'Free parking',
                '2 group classes per month'
            ]
        },
        {
            name: 'Premium',
            price: 49.99,
            features: [
                'All Basic features',
                'Unlimited group classes',
                'Personal trainer (2 sessions/month)',
                'Nutrition consultation',
                'Access to swimming pool',
                'Guest passes (2/month)'
            ]
        },
        {
            name: 'Elite',
            price: 79.99,
            features: [
                'All Premium features',
                'Unlimited personal training',
                'Priority class booking',
                'Spa access',
                'Unlimited guest passes',
                'Private locker',
                'Customized workout and nutrition plans'
            ]
        }
    ];
    res.json(plans);
});

// Subscribe to a membership plan
router.post('/subscribe', auth, async (req, res) => {
    try {
        const { plan } = req.body;
        
        if (!['basic', 'premium', 'elite'].includes(plan)) {
            return res.status(400).json({ message: 'Invalid membership plan' });
        }

        const user = req.user;
        user.membershipPlan = plan;
        user.membershipStartDate = new Date();
        
        // Set membership end date (1 year from start)
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        user.membershipEndDate = endDate;

        await user.save();
        res.json({
            message: 'Successfully subscribed to membership plan',
            membership: {
                plan: user.membershipPlan,
                startDate: user.membershipStartDate,
                endDate: user.membershipEndDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error subscribing to membership plan', error: error.message });
    }
});

// Get user's current membership status
router.get('/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('membershipPlan membershipStartDate membershipEndDate');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching membership status', error: error.message });
    }
});

// Cancel membership
router.post('/cancel', auth, async (req, res) => {
    try {
        const user = req.user;
        user.membershipPlan = 'basic';
        user.membershipEndDate = new Date();
        await user.save();
        res.json({ message: 'Membership cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling membership', error: error.message });
    }
});

// Upgrade membership
router.post('/upgrade', auth, async (req, res) => {
    try {
        const { newPlan } = req.body;
        
        if (!['premium', 'elite'].includes(newPlan)) {
            return res.status(400).json({ message: 'Invalid upgrade plan' });
        }

        const user = req.user;
        if (user.membershipPlan === 'elite') {
            return res.status(400).json({ message: 'Already on the highest tier' });
        }

        user.membershipPlan = newPlan;
        await user.save();
        res.json({
            message: 'Membership upgraded successfully',
            newPlan: user.membershipPlan
        });
    } catch (error) {
        res.status(500).json({ message: 'Error upgrading membership', error: error.message });
    }
});

module.exports = router; 