const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all diet plans
router.get('/plans', (req, res) => {
    const plans = [
        {
            name: 'Weight Loss',
            description: 'Perfect for those looking to shed pounds and improve overall health',
            features: [
                'Calorie deficit meal plans',
                'High-protein options',
                'Low-carb alternatives',
                'Meal prep guides',
                'Shopping lists',
                'Progress tracking'
            ],
            macronutrientSplit: {
                protein: '30%',
                carbs: '40%',
                fats: '30%'
            }
        },
        {
            name: 'Muscle Building',
            description: 'Optimized for muscle growth and strength gains',
            features: [
                'High-protein meal plans',
                'Calorie surplus options',
                'Pre/post workout meals',
                'Supplement recommendations',
                'Meal timing guides',
                'Progress tracking'
            ],
            macronutrientSplit: {
                protein: '40%',
                carbs: '40%',
                fats: '20%'
            }
        },
        {
            name: 'Athletic Performance',
            description: 'Designed for athletes and active individuals',
            features: [
                'Performance-optimized meals',
                'Energy-dense options',
                'Hydration guides',
                'Pre-competition meals',
                'Recovery nutrition',
                'Progress tracking'
            ],
            macronutrientSplit: {
                protein: '30%',
                carbs: '50%',
                fats: '20%'
            }
        },
        {
            name: 'Health & Wellness',
            description: 'Balanced nutrition for overall health and well-being',
            features: [
                'Balanced meal plans',
                'Whole food focus',
                'Anti-inflammatory options',
                'Gut health support',
                'Mindful eating guides',
                'Progress tracking'
            ],
            macronutrientSplit: {
                protein: '25%',
                carbs: '45%',
                fats: '30%'
            }
        }
    ];
    res.json(plans);
});

// Select a diet plan
router.post('/select', auth, async (req, res) => {
    try {
        const { plan } = req.body;
        
        if (!['weight-loss', 'muscle-building', 'athletic-performance', 'health-wellness'].includes(plan)) {
            return res.status(400).json({ message: 'Invalid diet plan' });
        }

        const user = req.user;
        user.dietPlan = plan;
        await user.save();
        res.json({
            message: 'Diet plan selected successfully',
            dietPlan: user.dietPlan
        });
    } catch (error) {
        res.status(500).json({ message: 'Error selecting diet plan', error: error.message });
    }
});

// Get user's current diet plan
router.get('/current', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('dietPlan');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching diet plan', error: error.message });
    }
});

// Get daily meal plan
router.get('/daily-plan', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const mealPlan = generateMealPlan(user.dietPlan);
        res.json(mealPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error generating meal plan', error: error.message });
    }
});

// Helper function to generate meal plan based on diet type
function generateMealPlan(dietType) {
    const mealPlans = {
        'weight-loss': {
            breakfast: {
                name: 'High-Protein Breakfast Bowl',
                calories: 350,
                macros: { protein: 25, carbs: 35, fats: 15 },
                ingredients: ['Eggs', 'Oatmeal', 'Greek yogurt', 'Berries', 'Almonds']
            },
            lunch: {
                name: 'Grilled Chicken Salad',
                calories: 400,
                macros: { protein: 35, carbs: 25, fats: 20 },
                ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil']
            },
            dinner: {
                name: 'Baked Salmon with Vegetables',
                calories: 450,
                macros: { protein: 40, carbs: 30, fats: 25 },
                ingredients: ['Salmon', 'Broccoli', 'Sweet potato', 'Lemon', 'Herbs']
            },
            snacks: [
                {
                    name: 'Protein Smoothie',
                    calories: 200,
                    macros: { protein: 20, carbs: 25, fats: 5 }
                },
                {
                    name: 'Mixed Nuts',
                    calories: 150,
                    macros: { protein: 5, carbs: 10, fats: 12 }
                }
            ]
        },
        'muscle-building': {
            breakfast: {
                name: 'Protein-Packed Breakfast',
                calories: 500,
                macros: { protein: 35, carbs: 45, fats: 20 },
                ingredients: ['Eggs', 'Whole grain toast', 'Avocado', 'Banana', 'Protein powder']
            },
            lunch: {
                name: 'Turkey and Quinoa Bowl',
                calories: 550,
                macros: { protein: 45, carbs: 50, fats: 20 },
                ingredients: ['Ground turkey', 'Quinoa', 'Mixed vegetables', 'Olive oil', 'Spices']
            },
            dinner: {
                name: 'Steak and Sweet Potato',
                calories: 600,
                macros: { protein: 50, carbs: 60, fats: 25 },
                ingredients: ['Lean steak', 'Sweet potato', 'Green beans', 'Butter', 'Herbs']
            },
            snacks: [
                {
                    name: 'Protein Shake',
                    calories: 250,
                    macros: { protein: 25, carbs: 30, fats: 5 }
                },
                {
                    name: 'Greek Yogurt with Granola',
                    calories: 200,
                    macros: { protein: 15, carbs: 25, fats: 8 }
                }
            ]
        },
        'athletic-performance': {
            breakfast: {
                name: 'Energy Boost Breakfast',
                calories: 450,
                macros: { protein: 25, carbs: 60, fats: 15 },
                ingredients: ['Oatmeal', 'Banana', 'Honey', 'Almonds', 'Protein powder']
            },
            lunch: {
                name: 'Power Bowl',
                calories: 500,
                macros: { protein: 30, carbs: 65, fats: 15 },
                ingredients: ['Brown rice', 'Chicken', 'Mixed vegetables', 'Sauce', 'Seeds']
            },
            dinner: {
                name: 'Performance Dinner',
                calories: 550,
                macros: { protein: 35, carbs: 70, fats: 15 },
                ingredients: ['Pasta', 'Lean meat', 'Vegetables', 'Olive oil', 'Herbs']
            },
            snacks: [
                {
                    name: 'Energy Bar',
                    calories: 200,
                    macros: { protein: 10, carbs: 30, fats: 5 }
                },
                {
                    name: 'Fruit and Nuts',
                    calories: 150,
                    macros: { protein: 5, carbs: 20, fats: 8 }
                }
            ]
        },
        'health-wellness': {
            breakfast: {
                name: 'Balanced Breakfast Bowl',
                calories: 400,
                macros: { protein: 20, carbs: 45, fats: 20 },
                ingredients: ['Quinoa', 'Eggs', 'Avocado', 'Spinach', 'Seeds']
            },
            lunch: {
                name: 'Mediterranean Bowl',
                calories: 450,
                macros: { protein: 25, carbs: 50, fats: 20 },
                ingredients: ['Chickpeas', 'Mixed vegetables', 'Olive oil', 'Feta', 'Herbs']
            },
            dinner: {
                name: 'Healthy Dinner Plate',
                calories: 500,
                macros: { protein: 30, carbs: 55, fats: 20 },
                ingredients: ['Fish', 'Brown rice', 'Vegetables', 'Olive oil', 'Lemon']
            },
            snacks: [
                {
                    name: 'Hummus and Vegetables',
                    calories: 150,
                    macros: { protein: 5, carbs: 15, fats: 8 }
                },
                {
                    name: 'Mixed Berries',
                    calories: 100,
                    macros: { protein: 2, carbs: 20, fats: 1 }
                }
            ]
        }
    };

    return mealPlans[dietType] || mealPlans['health-wellness'];
}

module.exports = router; 