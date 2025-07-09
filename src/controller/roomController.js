const { getAllRooms } = require("../models/roomModel");

/**
 * @swagger
 * /rooms/:
 *   get:
 *     summary: Get all available rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of rooms successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Meeting Room A
 *                       capacity:
 *                         type: integer
 *                         example: 10
 *       500:
 *         description: Server error while retrieving room data
 */

const listRoomsController = async (req, res) => {
  try {
    const rooms = await getAllRooms();
    res.json({ rooms });
  } catch (err) {
    console.error("Oda listeleme hatası:", err);
    res.status(500).json({ message: "Oda verileri alınamadı" });
  }
};

module.exports = {
  listRooms: listRoomsController,
};
