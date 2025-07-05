const express = require('express');
const {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  searchReservationsController
} = require('../controller/reservationController');

const { token } = require('../middleware/authMiddleware');

const router = express.Router();

// 📅 Rezervasyon işlemleri
router.post('/reservations', token, createReservation);                // Yeni rezervasyon oluştur
router.get('/reservations/me', token, getMyReservations);             // Kendi rezervasyonlarını listele
router.get('/reservations/:id', token, getReservationById);           // Belirli rezervasyon bilgisi
router.put('/reservations/:id', token, updateReservation);            // Güncelleme
router.delete('/reservations/:id', token, deleteReservation);         // Silme
router.get('/reservations', token, searchReservationsController);     // Filtreli listeleme

module.exports = router;
