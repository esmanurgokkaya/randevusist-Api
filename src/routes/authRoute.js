const express = require('express');
const { register, login } = require('../controller/authController');
const { getUserProfile} = require('../controller/userController');

const { token } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', token, getUserProfile);

module.exports = router;