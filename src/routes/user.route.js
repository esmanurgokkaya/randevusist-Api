const express = require('express');
const {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile
} = require('../controllers/user.controller'); // ✅ yeni controller dosyasına göre isim değişikliği

const { verifyToken, handleAuthError } = require('../middleware/authMiddleware');

const router = express.Router();

// 👤 Kullanıcı kendi profilini yönetebilir
router.get('/me', verifyToken, getUserProfile);
router.put('/me', verifyToken, updateUserProfile);
router.delete('/me', verifyToken, deleteUserProfile);

// Diğer middleware'leri en sona koymak doğru
router.use(handleAuthError);

module.exports = router;
