const express = require('express');
const {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile,
  changePassword
} = require('../controller/userController');

const { verifyToken, handleAuthError } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/users/me
 * @desc Kullanıcı kendi profil bilgilerini görüntüler
 * @access Protected (token gereklidir)
 */
router.get('/me', verifyToken, getUserProfile);

/**
 * @route PUT /api/users/me
 * @desc Kullanıcı kendi profil bilgilerini günceller
 * @access Protected (token gereklidir)
 */
router.put('/me', verifyToken, updateUserProfile);

/**
 * @route DELETE /api/users/me
 * @desc Kullanıcı kendi hesabını siler
 * @access Protected (token gereklidir)
 */
router.delete('/me', verifyToken, deleteUserProfile);

/**
 * @route PUT /api/users/me/change-password
 * @desc Kullanıcı kendi şifresini değiştirir
 * @access Protected (token gereklidir)
 */
router.put('/me/change-password', verifyToken, changePassword);

// Yetkilendirme hatalarını yakalamak için middleware
router.use(handleAuthError);

module.exports = router;
