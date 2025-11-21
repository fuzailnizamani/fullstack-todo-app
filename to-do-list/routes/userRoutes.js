const express = require('express');
const deleteProfilePicture  = require('../controllers/userController.js');
const authenticateToken = require('../middleware/authenticate.js');

const router = express.Router();

router.delete("/profile-picture", authenticateToken, deleteProfilePicture);
module.exports = router;