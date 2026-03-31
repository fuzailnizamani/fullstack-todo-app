const express = require('express');
const router = express.Router();

const { createTask, getAllTasks, getSingleTask, updateTask, deleteTask} = require('../controllers/taskController');

router.post('/createTasks', createTask);
router.get('/getalltasks', getAllTasks);
router.get('/gettask/:id', getSingleTask);
router.put('/updatetask/:id', updateTask);
router.delete('/deletetask/:id', deleteTask);

module.exports = router;