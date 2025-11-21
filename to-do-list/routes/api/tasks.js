const express = require('express');
const task = require('../../models/Task.js');
const router = express.Router();  // <-- Needed for preflight

router.post('/createTasks', async (req, res) => {
    console.log("Creating Task for User:", req.user._id);
    const { TaskName , TaskStatus } = req.body;
    console.log(req.user);
    if(!TaskName){
        return res.status(400).json({ msg: 'TaskName is required' });
    }
    const newTask = new task({
        TaskName: TaskName,
        TaskStatus: TaskStatus || false,
        user: req.user._id
    });

    try {
        const savedTask = await newTask.save();
        console.log('User saved:', savedTask);
        res.json({ msg: "Task Created", savedTask });
    } catch (err) {
        console.log('Error saving user:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/getALLTasks', async (req, res) => {
    try {
        const tasks = await task.find({ user: req.user._id });
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server Error');
    }   
});

router.get('/getTask/:id', async (req, res) => {
    try {
        const singleTask = await task.findById(req.params.id);

        if (!singleTask) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        console.log(singleTask.user);
        console.log(singleTask.user.toString()); 
        if(singleTask.user.toString() !== req.user._id){
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        res.json(singleTask);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.patch('/updateTask/:id', async (req, res) => {
    try {
        const updateTask = await task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
             req.body, 
            { new: true, runValidators: true });
        if (!updateTask) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        res.json(updateTask);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/deleteTask/:id', async (req, res) => {
    try {
        console.log("Delete Request User:", req.user._id);

        const deletedTask = await task.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        console.log("Deleted Task result:", deletedTask);

        if (!deletedTask) {
            return res.status(404).json({ msg: 'Task not found or not authorized' });
        }

        res.json({ msg: 'Task Deleted' });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


module.exports = router;