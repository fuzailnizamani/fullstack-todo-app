const express = require('express');
const User = require('../models/User.js');
const router = express.Router();


router.post('/', async (req, res) => {
    console.log('Register route accessed'); // Log when the route is accessed
    try {
        const { email, password } = req.body;
        console.log('Email:', email, 'Password:', password); // Log email and password

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Create new user (password will be Hashed by pre-save hook)
        user = new User({
            email,
            password,
        });

        // 3. Save user to DB
        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;