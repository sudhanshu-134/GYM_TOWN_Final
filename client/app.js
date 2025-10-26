// Main JavaScript file for the gym management website

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    
    // Route to correct page handler
    if (currentPath.includes('login.html')) {
        initializeLoginPage();
    } else if (currentPath.includes('signup.html')) {
        initializeSignupPage();
    } else if (currentPath.includes('dashboard.html')) {
        initializeDashboard();
    } else if (currentPath.includes('membership.html')) {
        initializeMembershipPage();
    } else if (currentPath.includes('diet.html')) {
        initializeDietPage();
    } else if (currentPath.includes('profile.html')) {
        initializeProfilePage();
    } else {
        // Home page or default
        initializeHomePage();
    }
});

// Home Page Initialization
function initializeHomePage() {
    console.log('Home page loaded');
}

// Login Page
function initializeLoginPage() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                // Simulate API call for login
                await login(email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                showError(error.message);
            }
        });
    }
}

// Signup Page
function initializeSignupPage() {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            
            try {
                // Simulate API call for signup
                await signup(name, email, password);
                window.location.href = 'login.html';
            } catch (error) {
                showError(error.message);
            }
        });
    }
}

// Dashboard Initialization
function initializeDashboard() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user info
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Load user progress data
    loadUserProgress();
}

// Membership Plans Page
function initializeMembershipPage() {
    const purchaseButtons = document.querySelectorAll('.purchase-plan');
    
    purchaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const planId = e.target.getAttribute('data-plan-id');
            purchaseMembershipPlan(planId);
        });
    });
}

// Diet Plans Page
function initializeDietPage() {
    const selectDietButtons = document.querySelectorAll('.select-diet');
    
    selectDietButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const dietId = e.target.getAttribute('data-diet-id');
            selectDietPlan(dietId);
        });
    });
}

// Profile Page Initialization
function initializeProfilePage() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to selected button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Load user profile data
    loadUserProfile();
    
    // Form submissions
    setupPersonalInfoForm();
    setupFitnessMetricsForm();
    setupAccountSettingsForm();
}

// Load user profile data
function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set user name in profile header
    const profileUserNameElement = document.getElementById('profile-user-name');
    if (profileUserNameElement) {
        profileUserNameElement.textContent = user.name || 'User';
    }
    
    // Personal Info
    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput) {
        fullNameInput.value = user.name || '';
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.value = user.email || '';
    }
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.value = user.phone || '';
    }
    
    const addressInput = document.getElementById('address');
    if (addressInput) {
        addressInput.value = user.address || '';
    }
    
    const birthdateInput = document.getElementById('birthdate');
    if (birthdateInput) {
        birthdateInput.value = user.birthdate || '';
    }
    
    // Fitness Metrics
    const currentWeightInput = document.getElementById('currentWeight');
    if (currentWeightInput) {
        currentWeightInput.value = user.currentWeight || '';
    }
    
    const goalWeightInput = document.getElementById('goalWeight');
    if (goalWeightInput) {
        goalWeightInput.value = user.goalWeight || '';
    }
    
    const heightInput = document.getElementById('height');
    if (heightInput) {
        heightInput.value = user.height || '';
    }
    
    const bodyFatInput = document.getElementById('bodyFat');
    if (bodyFatInput) {
        bodyFatInput.value = user.bodyFat || '';
    }
    
    const fitnessLevelInput = document.getElementById('fitnessLevel');
    if (fitnessLevelInput) {
        fitnessLevelInput.value = user.fitnessLevel || 'intermediate';
    }
    
    // Set fitness goals
    if (user.fitnessGoals) {
        user.fitnessGoals.forEach(goal => {
            const checkbox = document.getElementById(goal);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Set notification preferences
    if (user.notifications) {
        const emailNotificationsInput = document.getElementById('emailNotifications');
        if (emailNotificationsInput) {
            emailNotificationsInput.checked = user.notifications.email;
        }
        
        const smsNotificationsInput = document.getElementById('smsNotifications');
        if (smsNotificationsInput) {
            smsNotificationsInput.checked = user.notifications.sms;
        }
        
        const pushNotificationsInput = document.getElementById('pushNotifications');
        if (pushNotificationsInput) {
            pushNotificationsInput.checked = user.notifications.push;
        }
    }
}

// Handle personal info form submission
function setupPersonalInfoForm() {
    const personalInfoForm = document.getElementById('personal-info-form');
    
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedUser = getCurrentUser();
            if (!updatedUser) {
                showNotification('User session expired. Please login again.', true);
                window.location.href = 'login.html';
                return;
            }
            
            // Update user data
            updatedUser.name = document.getElementById('fullName').value;
            updatedUser.phone = document.getElementById('phone').value;
            updatedUser.address = document.getElementById('address').value;
            updatedUser.birthdate = document.getElementById('birthdate').value;
            updatedUser.gender = document.getElementById('gender').value;
            updatedUser.emergencyContact = document.getElementById('emergency-contact').value;
            
            try {
                await updateUserProfile(updatedUser);
                
                // Update the name in the header
                const profileUserNameElement = document.getElementById('profile-user-name');
                if (profileUserNameElement) {
                    profileUserNameElement.textContent = updatedUser.name;
                }
                
                showNotification('Personal information updated successfully');
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }
}

// Handle fitness metrics form submission
function setupFitnessMetricsForm() {
    const fitnessForm = document.getElementById('fitness-metrics-form');
    
    if (fitnessForm) {
        fitnessForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedUser = getCurrentUser();
            updatedUser.currentWeight = document.getElementById('currentWeight').value;
            updatedUser.goalWeight = document.getElementById('goalWeight').value;
            updatedUser.height = document.getElementById('height').value;
            updatedUser.bodyFat = document.getElementById('bodyFat').value;
            updatedUser.fitnessLevel = document.getElementById('fitnessLevel').value;
            
            // Get selected fitness goals
            updatedUser.fitnessGoals = [];
            const goalCheckboxes = document.querySelectorAll('input[name="fitnessGoal"]:checked');
            goalCheckboxes.forEach(checkbox => {
                updatedUser.fitnessGoals.push(checkbox.id);
            });
            
            try {
                await updateUserProfile(updatedUser);
                showNotification('Fitness metrics updated successfully');
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }
}

// Handle account settings form submission
function setupAccountSettingsForm() {
    const passwordForm = document.getElementById('password-form');
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword && newPassword !== confirmPassword) {
                showNotification('New passwords do not match', true);
                return;
            }
            
            try {
                if (newPassword) {
                    await changePassword(currentPassword, newPassword);
                    showNotification('Password updated successfully');
                }
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }
    
    // Notification preferences form
    const notificationForm = document.getElementById('notification-form');
    if (notificationForm) {
        notificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get notification preferences
            const emailNotifications = document.getElementById('emailNotifications').checked;
            const smsNotifications = document.getElementById('smsNotifications').checked;
            const pushNotifications = document.getElementById('pushNotifications').checked;
            
            const updatedUser = getCurrentUser();
            updatedUser.notifications = {
                email: emailNotifications,
                sms: smsNotifications,
                push: pushNotifications
            };
            
            try {
                await updateUserProfile(updatedUser);
                showNotification('Notification preferences updated successfully');
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                deleteUserAccount();
            }
        });
    }
}

// API Functions (simulated)
async function login(email, password) {
    // This would be a real API call in production
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate successful login
            if (email && password) {
                // Get the stored user data
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    resolve(user);
                } else {
                    // If no stored user, create a new one (simulating API response)
                    const user = {
                        id: '123',
                        name: 'John Doe', // Default name if no stored user
                        email: email,
                        membershipStatus: 'active'
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    resolve(user);
                }
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
}

async function signup(name, email, password) {
    // This would be a real API call in production
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate successful signup
            if (name && email && password) {
                // Store the user data with their name
                const user = {
                    id: '123',
                    name: name,
                    email: email,
                    membershipStatus: 'active'
                };
                localStorage.setItem('currentUser', JSON.stringify(user));
                resolve({ success: true });
            } else {
                reject(new Error('All fields are required'));
            }
        }, 1000);
    });
}

function getCurrentUser() {
    const userString = localStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
}

async function loadUserProgress() {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;
    
    // Simulate loading progress data
    const progressData = {
        attendanceRate: '85%',
        completedWorkouts: 24,
        currentWeight: '175 lbs',
        goalWeight: '160 lbs',
        dietAdherence: '90%'
    };
    
    // Update progress statistics
    Object.keys(progressData).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = progressData[key];
        }
    });
}

function purchaseMembershipPlan(planId) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    alert(`You have selected plan ${planId}. In a real application, this would take you to payment.`);
}

function selectDietPlan(dietId) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    alert(`You have selected diet plan ${dietId}. Your profile has been updated.`);
}

async function updateUserProfile(userData) {
    // This would be a real API call in production
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                localStorage.setItem('currentUser', JSON.stringify(userData));
                resolve({ success: true });
            } catch (error) {
                reject(new Error('Failed to update profile'));
            }
        }, 800);
    });
}

async function changePassword(currentPassword, newPassword) {
    // This would be a real API call in production
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // In a real app, we would verify the current password
            if (currentPassword && newPassword) {
                resolve({ success: true });
            } else {
                reject(new Error('Invalid password information'));
            }
        }, 800);
    });
}

function deleteUserAccount() {
    // This would be a real API call in production
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }, 1000);
}

// Utility functions
function showError(message) {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

function showNotification(message, isError = false) {
    // Create notification element if it doesn't exist
    let notificationElement = document.querySelector('.notification');
    
    if (!notificationElement) {
        notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        document.body.appendChild(notificationElement);
    }
    
    // Set message and style
    notificationElement.textContent = message;
    notificationElement.classList.toggle('error', isError);
    
    // Show notification
    notificationElement.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 3000);
}

// BMI Calculator
document.addEventListener('DOMContentLoaded', function() {
    const calculateBmiBtn = document.getElementById('calculate-bmi');
    if (calculateBmiBtn) {
        calculateBmiBtn.addEventListener('click', calculateBMI);
    }

    function calculateBMI() {
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value) / 100; // Convert cm to meters
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value);

        if (!weight || !height || !age) {
            alert('Please fill in all fields');
            return;
        }

        // Calculate BMI
        const bmi = weight / (height * height);
        const bmiRounded = Math.round(bmi * 10) / 10;

        // Update result
        document.getElementById('bmi-value').textContent = bmiRounded;
        
        // Show result section
        document.getElementById('bmi-result').style.display = 'block';

        // Determine BMI category and recommendation
        let category, recommendation, detailedDiet;
        
        if (bmi < 18.5) {
            category = 'Underweight';
            recommendation = 'Based on your BMI, we recommend our Muscle Building Diet Plan with added calories to help you gain healthy weight.';
            
            detailedDiet = `
                <h4>Personalized Diet Plan for Underweight (BMI: ${bmiRounded})</h4>
                <p>Your goal should be to gain weight in a healthy way by consuming nutrient-dense foods and a calorie surplus.</p>
                
                <h5>Daily Caloric Intake:</h5>
                <p>Aim for ${calculateCalorieNeeds(weight, height, age, gender, 'gain')} calories per day.</p>
                
                <h5>Macronutrient Distribution:</h5>
                <ul>
                    <li>Protein: 20-25% (focus on lean proteins like chicken, fish, eggs, dairy, legumes)</li>
                    <li>Carbohydrates: 50-60% (whole grains, starchy vegetables, fruits)</li>
                    <li>Fats: 25-30% (healthy oils, nuts, avocados)</li>
                </ul>
                
                <h5>Meal Plan Structure:</h5>
                <ul>
                    <li>Breakfast: High-protein breakfast with healthy carbs</li>
                    <li>Mid-morning snack: Protein and healthy fats (nuts, yogurt)</li>
                    <li>Lunch: Balanced meal with protein, complex carbs, and vegetables</li>
                    <li>Afternoon snack: Protein shake or fruit with nut butter</li>
                    <li>Dinner: Hearty meal with protein, starchy vegetables, and healthy fats</li>
                    <li>Evening snack: Protein-rich snack before bed</li>
                </ul>
                
                <h5>Key Recommendations:</h5>
                <ul>
                    <li>Eat frequently - 5-6 smaller meals throughout the day</li>
                    <li>Include calorie-dense foods like nuts, dried fruits, and healthy oils</li>
                    <li>Drink smoothies made with fruits, milk, protein powder, and nut butters</li>
                    <li>Combine with strength training for muscle gain rather than just fat gain</li>
                </ul>
            `;
            
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal weight';
            recommendation = 'Based on your BMI, we recommend our Health & Wellness Diet Plan to maintain your healthy weight and optimize nutrition.';
            
            detailedDiet = `
                <h4>Personalized Diet Plan for Normal Weight (BMI: ${bmiRounded})</h4>
                <p>Your goal should be to maintain your healthy weight while focusing on optimal nutrition and performance.</p>
                
                <h5>Daily Caloric Intake:</h5>
                <p>Aim for ${calculateCalorieNeeds(weight, height, age, gender, 'maintain')} calories per day.</p>
                
                <h5>Macronutrient Distribution:</h5>
                <ul>
                    <li>Protein: 15-20% (lean meats, fish, plant proteins)</li>
                    <li>Carbohydrates: 45-55% (focus on high-fiber complex carbs)</li>
                    <li>Fats: 25-35% (emphasize unsaturated fats)</li>
                </ul>
                
                <h5>Meal Plan Structure:</h5>
                <ul>
                    <li>Breakfast: Balanced breakfast with protein and fiber</li>
                    <li>Lunch: Lean protein with complex carbs and plenty of vegetables</li>
                    <li>Snacks: Whole foods like fruits, nuts, yogurt</li>
                    <li>Dinner: Lean protein, vegetables, and moderate carbohydrates</li>
                </ul>
                
                <h5>Key Recommendations:</h5>
                <ul>
                    <li>Focus on whole, unprocessed foods</li>
                    <li>Include a wide variety of colorful fruits and vegetables</li>
                    <li>Stay hydrated with 2-3 liters of water daily</li>
                    <li>Practice portion control and mindful eating</li>
                    <li>Adjust calorie intake based on activity level</li>
                </ul>
            `;
            
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            recommendation = 'Based on your BMI, we recommend our Weight Loss Diet Plan with a moderate calorie deficit to achieve healthy weight.';
            
            detailedDiet = `
                <h4>Personalized Diet Plan for Overweight (BMI: ${bmiRounded})</h4>
                <p>Your goal should be to gradually lose weight with a sustainable approach focused on nutrition, not just calorie restriction.</p>
                
                <h5>Daily Caloric Intake:</h5>
                <p>Aim for ${calculateCalorieNeeds(weight, height, age, gender, 'lose')} calories per day.</p>
                
                <h5>Macronutrient Distribution:</h5>
                <ul>
                    <li>Protein: 25-30% (to preserve muscle mass during weight loss)</li>
                    <li>Carbohydrates: 40-45% (focus on high-fiber options)</li>
                    <li>Fats: 25-30% (emphasize healthy fats)</li>
                </ul>
                
                <h5>Meal Plan Structure:</h5>
                <ul>
                    <li>Breakfast: High-protein breakfast with fiber</li>
                    <li>Lunch: Lean protein with large portion of vegetables and small portion of complex carbs</li>
                    <li>Snacks: Protein-based snacks with fiber (Greek yogurt, fruits, vegetables)</li>
                    <li>Dinner: Protein with vegetables and minimal starchy carbs</li>
                </ul>
                
                <h5>Key Recommendations:</h5>
                <ul>
                    <li>Create a moderate calorie deficit (300-500 calories below maintenance)</li>
                    <li>Emphasize protein to maintain muscle and increase satiety</li>
                    <li>Focus on high-volume, low-calorie foods like vegetables</li>
                    <li>Limit refined carbohydrates and added sugars</li>
                    <li>Practice portion control and mindful eating</li>
                    <li>Include regular physical activity</li>
                </ul>
            `;
            
        } else {
            category = 'Obese';
            recommendation = 'Based on your BMI, we recommend our Weight Loss Diet Plan with professional guidance for safe, sustainable weight loss.';
            
            detailedDiet = `
                <h4>Personalized Diet Plan for Obesity (BMI: ${bmiRounded})</h4>
                <p>Your goal should be to gradually lose weight with a comprehensive approach that includes professional guidance.</p>
                
                <h5>Daily Caloric Intake:</h5>
                <p>Aim for ${calculateCalorieNeeds(weight, height, age, gender, 'lose-significant')} calories per day.</p>
                
                <h5>Macronutrient Distribution:</h5>
                <ul>
                    <li>Protein: 30-35% (higher protein for satiety and muscle preservation)</li>
                    <li>Carbohydrates: 35-40% (focus on high-fiber, low-glycemic options)</li>
                    <li>Fats: 25-30% (emphasize omega-3 and monounsaturated fats)</li>
                </ul>
                
                <h5>Meal Plan Structure:</h5>
                <ul>
                    <li>Breakfast: High-protein, low-carbohydrate options</li>
                    <li>Lunch: Lean protein with abundant non-starchy vegetables</li>
                    <li>Snacks: Protein and fiber-rich options</li>
                    <li>Dinner: Lean protein with vegetables and minimal starchy foods</li>
                </ul>
                
                <h5>Key Recommendations:</h5>
                <ul>
                    <li>Work with a healthcare provider or registered dietitian</li>
                    <li>Focus on whole, unprocessed foods</li>
                    <li>Consider a structured eating approach (e.g., intermittent fasting if approved by doctor)</li>
                    <li>Monitor portions carefully</li>
                    <li>Stay well-hydrated - drink water before meals</li>
                    <li>Include regular physical activity with both cardio and strength training</li>
                    <li>Track food intake to maintain awareness</li>
                </ul>
                
                <p><strong>Note:</strong> Please consult with a healthcare professional before starting this plan.</p>
            `;
        }

        document.getElementById('bmi-category').textContent = category;
        document.getElementById('diet-recommendation').textContent = recommendation;
        
        // Add detailed diet plan
        if (!document.getElementById('detailed-diet')) {
            const detailedDietDiv = document.createElement('div');
            detailedDietDiv.id = 'detailed-diet';
            detailedDietDiv.className = 'detailed-diet';
            document.getElementById('bmi-result').appendChild(detailedDietDiv);
        }
        
        document.getElementById('detailed-diet').innerHTML = detailedDiet;

        // Scroll to the result section
        document.getElementById('bmi-result').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Calculate calorie needs based on weight, height, age, gender, and goal
    function calculateCalorieNeeds(weight, height, age, gender, goal) {
        // Basic BMR calculation using Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * (height * 100) - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * (height * 100) - 5 * age - 161;
        }
        
        // Adjust for activity level (using moderate activity as default)
        const maintenanceCalories = Math.round(bmr * 1.55);
        
        // Adjust based on goal
        switch(goal) {
            case 'gain':
                return Math.round(maintenanceCalories + 500);
            case 'lose':
                return Math.round(maintenanceCalories - 500);
            case 'lose-significant':
                return Math.round(maintenanceCalories - 750);
            case 'maintain':
            default:
                return maintenanceCalories;
        }
    }
}); 