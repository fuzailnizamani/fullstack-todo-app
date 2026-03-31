const pool = require('../config/db');

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, is_completed } = req.body;
        if (!title || !description || is_completed === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide title, description and completion status' });
        }

        const userId = req.user.userId;

        const sql = 'INSERT INTO tasks (title, description, is_completed, userId) VALUES (?, ?, ?, ?)';
        const values = [title, description, is_completed, userId];
        const [result] = await pool.query(sql, values);

        res.status(201).json({ success: true, message: 'Task created successfully!', taskId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error creating task' });
    }
};

// Get all tasks for the logged-in user
const getAllTasks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const sql = 'SELECT * FROM tasks WHERE userId = ? ORDER BY id DESC';
        const [tasks] = await pool.query(sql, [userId]);

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error retrieving tasks' });
    }
};

// Get a single task by its ID
const getSingleTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const sql = 'SELECT * FROM tasks WHERE id = ? AND userId = ?';
        const [task] = await pool.query(sql, [id, userId]);

        if (task.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, data: task[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error retrieving task' });
    }
};

// Update a task by its ID
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { title, description, is_completed } = req.body;
        const updateFields = [];
        const values = [];

        if (title !== undefined) {
            updateFields.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            values.push(description);
        }
        if (is_completed !== undefined) {
            updateFields.push('is_completed = ?');
            values.push(is_completed);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        const sql = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND userId = ?`;
        values.push(id, userId);

        const [result] = await pool.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, message: 'Task updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error updating task' });
    }
};

// Delete a task by its ID
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const sql = 'DELETE FROM tasks WHERE id = ? AND userId = ?';
        const [result] = await pool.query(sql, [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error deleting task' });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getSingleTask,
    updateTask,
    deleteTask
};