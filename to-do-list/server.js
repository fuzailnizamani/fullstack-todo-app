const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const path = require('path');
const profileRouter = require('./routes/api/profile.js');
const connectDB = require('./config/db');
const port = 3000;
const cors = require('cors');
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

// simple request logger to make sure requests reach this process
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] PID:${process.pid} ${req.method} ${req.url}`);
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/register', require('./routes/Register.js'));
app.use('/login', require('./routes/login.js'));

app.use('/api/tasks', require('./middleware/authenticate.js'),require('./routes/api/tasks.js'));
app.use('/get/profile', require('./middleware/authenticate.js'), profileRouter);
app.use('/api/profile', require('./middleware/authenticate.js'),profileRouter);
app.use('/user', require('./middleware/authenticate.js'),require('./routes/userRoutes.js'));


connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}).catch(err => console.log(err));