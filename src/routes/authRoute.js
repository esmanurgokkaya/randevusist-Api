const express = require('express');
const { register, login, refresh, logout } = require('../controller/authController');

const router = express.Router();

/**
 * @route POST /auth/register
 * @desc Yeni kullanıcı kaydı yapar
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /auth/login
 * @desc Kullanıcı giriş işlemi yapar, access ve refresh token döner
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /auth/refresh-token
 * @desc Geçerli refresh token ile yeni access ve refresh token oluşturur
 * @access Public
 */
router.post('/refresh-token', refresh);

/**
 * @route POST /auth/logout
 * @desc Kullanıcı çıkış yapar, refresh token veritabanından silinir
 * @access Public
 */
router.post('/logout', logout);

module.exports = router;
