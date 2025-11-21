const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    TaskName: { 
        type: String, 
        required: true 
    },

    TaskStatus: {
         type: Boolean, 
         default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;