const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);

module.exports = router;