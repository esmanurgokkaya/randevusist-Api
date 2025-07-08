const express = require('express');
const {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  searchReservations
} = require('../controllers/reservation.controller');

const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 🎯 Kullanıcı Rezervasyon Rotaları
router.post('/reservations', verifyToken, createReservation);               // Yeni rezervasyon oluştur
router.get('/reservations/me', verifyToken, getMyReservations);             // Kullanıcının rezervasyonları
router.get('/reservations/:id', verifyToken, getReservationById);           // Belirli rezervasyon detayı
router.put('/reservations/:id', verifyToken, updateReservation);            // Rezervasyon güncelle
router.delete('/reservations/:id', verifyToken, deleteReservation);         // Rezervasyon sil

// 🔍 Filtreli Listeleme (tarih, oda vs.)
router.get('/reservations', verifyToken, searchReservations);               // Filtreli listeleme (sayfa, tarih vs.)

module.exports = router;
