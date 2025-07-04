const express = require('express');
const { getUserProfile, deleteUserProfile, updateUserProfile} = require('../controller/userController');

const { token } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', token, getUserProfile);
router.delete('/profile/delete', token, deleteUserProfile);
router.put('/profile/update', token, deleteUserProfile);



module.exports = router;