const express = require("express");
const router = express.Router();
const { listRooms, createRooms, updateRooms, deleteRooms } = require("../controller/roomController");
const { verifyToken ,checkPermission } = require('../middleware/authMiddleware');


router.get("/", listRooms); // /api/rooms
router.post("/", verifyToken, checkPermission("create_room"), createRooms); // /api/rooms
router.put("/:id", verifyToken, checkPermission("updtae_room"), updateRooms); // /api/rooms
router.delete("/:id", verifyToken, checkPermission("delete_room"),deleteRooms); // /api/rooms

module.exports = router;
