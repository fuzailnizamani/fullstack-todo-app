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
            { expiresIn: '1h' }
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

// --- Logout User ---
const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token is required' });
        }

        // Search the database for the user with this token and set it to NULL
        const sql = 'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?';
        const [result] = await pool.query(sql, [refreshToken]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: 'Invalid token or already logged out' });
        }

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error.message);
        res.status(500).json({ success: false, error: 'Server error during logout' });
    }
};

// --- Refresh Token ---
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token is required' });
        }

        // 1. Check if the refresh token exists in the database
        const sql = 'SELECT id, email FROM users WHERE refresh_token = ?';
        const [rows] = await pool.query(sql, [refreshToken]);

        if (!rows || rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Invalid refresh token' });
        }

        const user = rows[0];

        // 2. Verify the refresh token cryptographically
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // If token is expired or altered, return 403 Forbidden
                return res.status(403).json({ success: false, message: 'Refresh token expired or invalid' });
            }

            // 3. Generate a new Access Token
            const newAccessToken = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.ACCESS_TOKEN_SECRET, 
                { expiresIn: '15m' }
            );

            // 4. Send the new access token to the client
            res.status(200).json({
                success: true,
                accessToken: newAccessToken
            });
        });

    } catch (error) {
        console.error('Error refreshing token:', error.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}