const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get workout history
router.get('/history', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('workoutHistory');
        res.json(user.workoutHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workout history', error: error.message });
    }
});

// Log a new workout
router.post('/log', auth, async (req, res) => {
    try {
        const { workoutType, duration, exercises } = req.body;

        const user = req.user;
        user.workoutHistory.push({
            date: new Date(),
            workoutType,
            duration,
            exercises
        });

        await user.save();
        res.json({
            message: 'Workout logged successfully',
            workout: user.workoutHistory[user.workoutHistory.length - 1]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging workout', error: error.message });
    }
});

// Get workout statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('workoutHistory');
        const stats = calculateWorkoutStats(user.workoutHistory);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workout statistics', error: error.message });
    }
});

// Get recommended workouts based on user's goals
router.get('/recommendations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('fitnessGoals');
        const recommendations = generateWorkoutRecommendations(user.fitnessGoals);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Error generating workout recommendations', error: error.message });
    }
});

// Helper function to calculate workout statistics
function calculateWorkoutStats(workoutHistory) {
    const stats = {
        totalWorkouts: workoutHistory.length,
        totalDuration: 0,
        averageDuration: 0,
        workoutsByType: {},
        recentWorkouts: [],
        monthlyProgress: {}
    };

    // Calculate total duration and workouts by type
    workoutHistory.forEach(workout => {
        stats.totalDuration += workout.duration;
        stats.workoutsByType[workout.workoutType] = (stats.workoutsByType[workout.workoutType] || 0) + 1;
    });

    // Calculate average duration
    stats.averageDuration = stats.totalWorkouts > 0 ? stats.totalDuration / stats.totalWorkouts : 0;

    // Get recent workouts (last 5)
    stats.recentWorkouts = workoutHistory
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

    // Calculate monthly progress
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return date.toISOString().slice(0, 7); // Format: YYYY-MM
    });

    last6Months.forEach(month => {
        const monthWorkouts = workoutHistory.filter(workout => 
            workout.date.toISOString().slice(0, 7) === month
        );
        stats.monthlyProgress[month] = {
            totalWorkouts: monthWorkouts.length,
            totalDuration: monthWorkouts.reduce((sum, workout) => sum + workout.duration, 0),
            averageDuration: monthWorkouts.length > 0 
                ? monthWorkouts.reduce((sum, workout) => sum + workout.duration, 0) / monthWorkouts.length 
                : 0
        };
    });

    return stats;
}

// Helper function to generate workout recommendations
function generateWorkoutRecommendations(fitnessGoals) {
    const recommendations = {
        'weight-loss': [
            {
                name: 'Cardio Blast',
                duration: 45,
                intensity: 'High',
                exercises: [
                    { name: 'Running', duration: '20 minutes', intensity: 'Moderate' },
                    { name: 'Jump Rope', duration: '10 minutes', intensity: 'High' },
                    { name: 'Burpees', sets: 3, reps: 12, rest: '60 seconds' },
                    { name: 'Mountain Climbers', duration: '5 minutes', intensity: 'High' }
                ]
            },
            {
                name: 'HIIT Circuit',
                duration: 30,
                intensity: 'High',
                exercises: [
                    { name: 'Sprint Intervals', duration: '15 minutes', intensity: 'High' },
                    { name: 'Kettlebell Swings', sets: 4, reps: 15, rest: '45 seconds' },
                    { name: 'Box Jumps', sets: 3, reps: 10, rest: '60 seconds' },
                    { name: 'Plank to Push-up', sets: 3, reps: 8, rest: '45 seconds' }
                ]
            }
        ],
        'muscle-gain': [
            {
                name: 'Upper Body Strength',
                duration: 60,
                intensity: 'Moderate',
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 8, rest: '90 seconds' },
                    { name: 'Pull-ups', sets: 3, reps: 10, rest: '90 seconds' },
                    { name: 'Shoulder Press', sets: 3, reps: 12, rest: '60 seconds' },
                    { name: 'Tricep Extensions', sets: 3, reps: 12, rest: '60 seconds' }
                ]
            },
            {
                name: 'Lower Body Power',
                duration: 60,
                intensity: 'Moderate',
                exercises: [
                    { name: 'Squats', sets: 4, reps: 8, rest: '90 seconds' },
                    { name: 'Romanian Deadlifts', sets: 3, reps: 10, rest: '90 seconds' },
                    { name: 'Lunges', sets: 3, reps: 12, rest: '60 seconds' },
                    { name: 'Calf Raises', sets: 3, reps: 15, rest: '60 seconds' }
                ]
            }
        ],
        'endurance': [
            {
                name: 'Long Distance Run',
                duration: 60,
                intensity: 'Moderate',
                exercises: [
                    { name: 'Warm-up Run', duration: '10 minutes', intensity: 'Low' },
                    { name: 'Steady State Run', duration: '40 minutes', intensity: 'Moderate' },
                    { name: 'Cool-down Run', duration: '10 minutes', intensity: 'Low' }
                ]
            },
            {
                name: 'Endurance Circuit',
                duration: 45,
                intensity: 'Moderate',
                exercises: [
                    { name: 'Rowing', duration: '15 minutes', intensity: 'Moderate' },
                    { name: 'Cycling', duration: '15 minutes', intensity: 'Moderate' },
                    { name: 'Swimming', duration: '15 minutes', intensity: 'Moderate' }
                ]
            }
        ],
        'flexibility': [
            {
                name: 'Yoga Flow',
                duration: 45,
                intensity: 'Low',
                exercises: [
                    { name: 'Sun Salutations', duration: '10 minutes' },
                    { name: 'Standing Poses', duration: '15 minutes' },
                    { name: 'Seated Poses', duration: '10 minutes' },
                    { name: 'Cool-down Stretches', duration: '10 minutes' }
                ]
            },
            {
                name: 'Stretching Routine',
                duration: 30,
                intensity: 'Low',
                exercises: [
                    { name: 'Dynamic Stretches', duration: '10 minutes' },
                    { name: 'Static Stretches', duration: '15 minutes' },
                    { name: 'Cool-down', duration: '5 minutes' }
                ]
            }
        ],
        'strength': [
            {
                name: 'Full Body Strength',
                duration: 60,
                intensity: 'High',
                exercises: [
                    { name: 'Deadlifts', sets: 4, reps: 6, rest: '120 seconds' },
                    { name: 'Squats', sets: 4, reps: 8, rest: '120 seconds' },
                    { name: 'Bench Press', sets: 4, reps: 8, rest: '120 seconds' },
                    { name: 'Pull-ups', sets: 3, reps: 8, rest: '90 seconds' }
                ]
            },
            {
                name: 'Power Lifting',
                duration: 75,
                intensity: 'High',
                exercises: [
                    { name: 'Squats', sets: 5, reps: 5, rest: '180 seconds' },
                    { name: 'Bench Press', sets: 5, reps: 5, rest: '180 seconds' },
                    { name: 'Deadlifts', sets: 5, reps: 5, rest: '180 seconds' }
                ]
            }
        ]
    };

    // Return recommendations based on user's goals
    return fitnessGoals.map(goal => ({
        goal,
        workouts: recommendations[goal] || []
    }));
}

module.exports = router; 