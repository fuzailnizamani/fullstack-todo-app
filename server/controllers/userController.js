const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const JWT = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username, email and password' });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        const values = [username, email, hashedPassword];
        const [result] = await pool.query(sql, values);

        res.status(201).json({
            message: 'User added successfully!',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const sql = 'SELECT id, username, email, password_hash FROM users WHERE email = ?';
        const [rows] = await pool.query(sql, [email]);

        if (!rows || rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const accessToken = JWT.sign(
            { userId: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = JWT.sign(
            { userId: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        const updateSql = 'UPDATE users SET refresh_token = ? WHERE id = ?';
        await pool.query(updateSql, [refreshToken, user.id ]);
        res.json({ success: true, token: accessToken, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Error login user:', error.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

module.exports = {
    registerUser,
    loginUser
}