const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const userRoutes = require('./routes/userRoute');
const taskRoutes = require('./routes/taskRoute');
const PORT = process.env.PORT || 5000;
const authenticateToken = require('./middleware/authenticateToken');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/api', userRoutes);
app.use('/api', authenticateToken, taskRoutes);

// Test Database Connection Route
app.get('/api/test-db', async (req, res) => {
    try {
    // This runs a simple math query on your MySQL server to prove it's connected
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ 
      success: true, 
      message: 'MySQL is successfully connected!', 
      data: rows[0] 
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})