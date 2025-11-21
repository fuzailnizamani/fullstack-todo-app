const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    }, 
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    avatar: {
        type: String,
        default: null
    },
    avatarPublicId: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// This is a "pre-save hook"
// Before saving a new user, this function will run
UserSchema.pre('save', async function(){
    // Hash password if user have modified the password
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    };
});

const User = mongoose.model('User', UserSchema);

module.exports = User;