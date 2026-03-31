const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshAccessToken } = require('../controllers/userController');

router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.post('/logoutUser', logoutUser);
router.post('/refreshAccessToken', refreshAccessToken);

module.exports = router;