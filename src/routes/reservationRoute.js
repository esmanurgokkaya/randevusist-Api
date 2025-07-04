const express = require('express');
const {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  deleteReservation
} = require('../controller/reservationController');

const { token } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-reservation', token, createReservation);
router.get('/my-reservations', token, getMyReservations);
router.get('/reservation/:id', token, getReservationById);
router.put('/update-reservation/:id', token, updateReservation);
router.delete('/delete-reservation/:id', token, deleteReservation);

module.exports = router;
