const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {email, password } = req.body;
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare the provided password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        console.log("Login Success | Token:", token);
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;