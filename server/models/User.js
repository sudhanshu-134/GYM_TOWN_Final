const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    membershipPlan: {
        type: String,
        enum: ['basic', 'premium', 'elite'],
        default: 'basic'
    },
    membershipStartDate: {
        type: Date
    },
    membershipEndDate: {
        type: Date
    },
    dietPlan: {
        type: String,
        enum: ['weight-loss', 'muscle-building', 'athletic-performance', 'health-wellness'],
        default: 'health-wellness'
    },
    currentWeight: {
        type: Number
    },
    goalWeight: {
        type: Number
    },
    height: {
        type: Number
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    fitnessGoals: [{
        type: String,
        enum: ['weight-loss', 'muscle-gain', 'endurance', 'flexibility', 'strength']
    }],
    workoutHistory: [{
        date: Date,
        workoutType: String,
        duration: Number,
        exercises: [{
            name: String,
            sets: Number,
            reps: Number,
            weight: Number
        }]
    }],
    weightHistory: [{
        date: Date,
        weight: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 