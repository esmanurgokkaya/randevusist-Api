const express = require('express');
const router = express.Router();

const roomController = require('../controllers/room.controller');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// ───────────────────────────────
// 👤 Public Routes (Client Access)
// ───────────────────────────────

// Uygun (available) odaları getir — kullanıcıya açık
router.get('/available', roomController.getAvailableRooms);

// Tüm odaları getir — kullanıcıya açık
router.get('/', roomController.listRooms);

// ───────────────────────────────
// 🛠️ Admin Routes (Admin Panel)
// ───────────────────────────────

// Sayfa + arama ile oda getir
router.get('/search', verifyToken, requireRole('admin'), roomController.searchRooms);

// Yeni oda oluştur
router.post('/', verifyToken, requireRole('admin'), roomController.createRoom);

// Oda bilgilerini güncelle
router.put('/:id', verifyToken, requireRole('admin'), roomController.updateRoom);

// Oda görselini güncelle
router.patch('/:id/image', verifyToken, requireRole('admin'), roomController.updateRoomImage);

// Oda durumunu güncelle (örn: kullanımda, bakımda)
router.patch('/:id/status', verifyToken, requireRole('admin'), roomController.updateRoomStatus);

// Odayı sil
router.delete('/:id', verifyToken, requireRole('admin'), roomController.deleteRoom);

module.exports = router;
