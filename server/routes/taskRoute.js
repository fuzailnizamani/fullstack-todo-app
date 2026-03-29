const express = require('express');
const router = express.Router();

const createTask = require('../controllers/taskController');

router.post('/createTasks', createTask);

module.exports = router;