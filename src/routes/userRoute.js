const express = require('express');
const {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile
} = require('../controller/userController');

const { token } = require('../middleware/authMiddleware');

const router = express.Router();

// 👤 Kullanıcı kendi profil bilgilerini görüntüleyebilir, güncelleyebilir, silebilir
router.get('/me', token, getUserProfile);
router.put('/me', token, updateUserProfile);
router.delete('/me', token, deleteUserProfile);

module.exports = router;
