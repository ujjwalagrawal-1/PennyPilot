import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    // minlength: [3, 'Username must be at least 3 characters'],
    // maxlength: [20, 'Username cannot exceed 20 characters'],
    // match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [4, 'Password must be at least 4 characters']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [50, 'Full name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: 'IND',
    enum: {
      values: ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK'],
      message: 'Currency not supported'
    }
  },
  monthlyBudget: {
    type: Number,
    default: 0,
    min: [0, 'Monthly budget cannot be negative']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  refreshToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
userSchema.index({ isActive: 1 });

// =======================
// 🔒 PRE-SAVE MIDDLEWARE - Hash Password
// =======================
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// =======================
// 🛠️ INSTANCE METHODS
// =======================

// Check if entered password is correct
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { 
            id: this._id, 
            email: this.email, 
            username: this.username 
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
};

// Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = jwt.sign(
        { id: this._id },
        process.env.RESET_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10m' }
    );
    
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

// Generate Email Verification Token
userSchema.methods.generateEmailVerificationToken = function () {
    const verificationToken = jwt.sign(
        { id: this._id, email: this.email },
        process.env.VERIFICATION_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '24h' }
    );
    
    this.emailVerificationToken = verificationToken;
    return verificationToken;
};
// Get user's full profile (excluding sensitive data)
userSchema.virtual('profile').get(function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
        avatar: this.avatar,
        currency: this.currency,
        monthlyBudget: this.monthlyBudget,
        isEmailVerified: this.isEmailVerified,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt
    };
});

// Find user by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });
};

// Find active users only
userSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};
export const User = mongoose.model('User', userSchema);