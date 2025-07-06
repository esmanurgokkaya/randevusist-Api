const express = require('express');
const {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  searchReservationsController
} = require('../controller/reservationController');

const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 📅 Rezervasyon işlemleri
router.post('/reservations', verifyToken, createReservation);                // Yeni rezervasyon oluştur
router.get('/reservations/me', verifyToken, getMyReservations);             // Kendi rezervasyonlarını listele
router.get('/reservations/:id', verifyToken, getReservationById);           // Belirli rezervasyon bilgisi
router.put('/reservations/:id', verifyToken, updateReservation);            // Güncelleme
router.delete('/reservations/:id', verifyToken, deleteReservation);         // Silme
router.get('/reservations', verifyToken, searchReservationsController);     // Filtreli listeleme

module.exports = router;
