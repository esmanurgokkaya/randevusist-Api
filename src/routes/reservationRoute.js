const express = require('express');
const {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  searchReservationsController
} = require('../controller/reservationController');

const { verifyToken,requireRole ,checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/reservations', verifyToken, checkPermission('create_reservation'), createReservation);                
router.get('/reservations/me', verifyToken, getMyReservations);             
router.get('/reservations/:id', verifyToken, getReservationById);           
router.put('/reservations/:id', verifyToken, checkPermission('update_reservation'), updateReservation);            
router.delete('/reservations/:id', verifyToken, checkPermission('delete_reservation'), deleteReservation);        
router.get('/reservations', verifyToken, searchReservationsController);     

module.exports = router;
