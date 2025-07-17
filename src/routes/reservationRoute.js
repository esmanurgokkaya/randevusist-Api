const express = require('express');
const {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  searchReservationsController
} = require('../controller/reservationController');

const { verifyToken, requireRole, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /reservations
 * @desc Yeni rezervasyon oluşturur
 * @access Protected (create_reservation izni gerekli)
 */
router.post('/reservations', verifyToken, checkPermission('create_reservation'), createReservation);

/**
 * @route GET /reservations/me
 * @desc Kullanıcının kendi rezervasyonlarını getirir
 * @access Protected (token gerekli)
 */
router.get('/reservations/me', verifyToken, getMyReservations);

/**
 * @route GET /reservations/:id
 * @desc ID ile rezervasyon detayını getirir
 * @access Protected (token gerekli)
 */
router.get('/reservations/:id', verifyToken, getReservationById);

/**
 * @route PUT /reservations/:id
 * @desc Rezervasyonu günceller
 * @access Protected (update_reservation izni gerekli)
 */
router.put('/reservations/:id', verifyToken, checkPermission('update_reservation'), updateReservation);

/**
 * @route DELETE /reservations/:id
 * @desc Rezervasyonu siler
 * @access Protected (delete_reservation izni gerekli)
 */
router.delete('/reservations/:id', verifyToken, checkPermission('delete_reservation'), deleteReservation);

/**
 * @route GET /reservations
 * @desc Rezervasyonları filtre ve sayfalama ile listeler
 * @access Protected (token gerekli)
 */
router.get('/reservations', verifyToken, searchReservationsController);

module.exports = router;
