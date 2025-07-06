const express = require('express');
const {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile
} = require('../controller/userController');

const { verifyToken, handleAuthError } = require('../middleware/authMiddleware');

const router = express.Router();

// 👤 Kullanıcı kendi profil bilgilerini görüntüleyebilir, güncelleyebilir, silebilir
router.get('/me', verifyToken, getUserProfile);
router.put('/me', verifyToken, updateUserProfile);
router.delete('/me', verifyToken, deleteUserProfile);
router.use(handleAuthError);
module.exports = router;
