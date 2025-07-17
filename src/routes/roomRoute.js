const express = require("express");
const router = express.Router();
const { listRooms, createRooms, updateRooms, deleteRooms } = require("../controller/roomController");
const { verifyToken, checkPermission } = require('../middleware/authMiddleware');

/**
 * @route GET /api/rooms
 * @desc Tüm odaların listesini döner
 * @access Public (yetki gerekmiyor)
 */
router.get("/", listRooms);

/**
 * @route POST /api/rooms
 * @desc Yeni oda oluşturur
 * @access Protected (create_room izni gerekli)
 */
router.post("/", verifyToken, checkPermission("create_room"), createRooms);

/**
 * @route PUT /api/rooms/:id
 * @desc Belirtilen ID'ye sahip odayı günceller
 * @access Protected (update_room izni gerekli)
 */
router.put("/:id", verifyToken, checkPermission("update_room"), updateRooms);

/**
 * @route DELETE /api/rooms/:id
 * @desc Belirtilen ID'ye sahip odayı siler
 * @access Protected (delete_room izni gerekli)
 */
router.delete("/:id", verifyToken, checkPermission("delete_room"), deleteRooms);

module.exports = router;
