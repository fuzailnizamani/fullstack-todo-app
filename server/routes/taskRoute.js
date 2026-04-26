const express = require('express');
const router = express.Router();

const { createTask, getAllTasks, getSingleTask, updateTask, deleteTask} = require('../controllers/taskController');

router.post('/createTasks', createTask);
router.get('/getallTasks', getAllTasks);
router.get('/getTask/:id', getSingleTask);
router.put('/updateTask/:id', updateTask);
router.delete('/deleteTask/:id', deleteTask);

module.exports = router;