const express = require('express');
const { getUserProfile} = require('../controller/userController');

const { token } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', token, getUserProfile);

module.exports = router;