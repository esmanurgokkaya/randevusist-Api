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


router.post('/reservations', verifyToken, createReservation);                
router.get('/reservations/me', verifyToken, getMyReservations);             
router.get('/reservations/:id', verifyToken, getReservationById);           
router.put('/reservations/:id', verifyToken, updateReservation);            
router.delete('/reservations/:id', verifyToken, deleteReservation);        
router.get('/reservations', verifyToken, searchReservationsController);     

module.exports = router;
