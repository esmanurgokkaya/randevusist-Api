const express = require('express');
const { register, login } = require('../controller/authController');

const router = express.Router();

// 🔐 Kullanıcı kayıt ve giriş
router.post('/register', register);
router.post('/login', login);
// 📌 Refresh token endpointi
router.post("/refresh-token", refresh);

// 📌 Çıkış işlemi (refresh token'ı veritabanından siler)
router.post("/logout", logout);

module.exports = router;
