const pool = require('../config/db');

const createTask = async (req, res) => {
    try {
        const { title, description, is_completed } = req.body;
        if (!title || !description || is_completed === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide title, description and completion status' });
        }

        const userId = req.user.userId; // Get user ID from the authenticated token

        const sql = 'INSERT INTO tasks (title, description, is_completed, userId) VALUES (?, ?, ?, ?)';
        const values = [title, description, is_completed, userId];
        const [result] = await pool.query(sql, values);
        res.status(201).json({ message: 'Task created successfully!', taskId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error hi' });
    }
};

module.exports = createTask;