const { getAllRooms, createRoom, updateRoomById, deleteRoomById } = require("../models/roomModel");
const logger = require("../utils/logger");

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
    logger.info(`Rooms fetched successfully. Count: ${rooms.length}`);
    res.json({ rooms });
  } catch (err) {
    logger.error(`Error fetching rooms: ${err.message}`);
    res.status(500).json({ message: "Oda verileri alınamadı" });
  }
};

const createRooms = async (req, res) => {
  const { name, cover, status } = req.body;
  try {
    const result = await createRoom(name, cover, status);
    logger.info(`Room created successfully: ${name}`);
    res.status(201).json({ message: "Oda başarıyla oluşturuldu", room: result });
  } catch (err) {
    logger.error(`Error creating room: ${err.message}`);
    res.status(500).json({ message: "Oda oluşturulamadı" });
  }
};

  const updateRooms = async (req, res) => {
    const {id} = req.params;
    const {name, cover, status} = req.body;
    try{
      const result = await updateRoomById(id, name, cover, status);
      if(result.affectedRows === 0){
        return res.status(404).json({ message: "Oda bulunamadı"});
      }
      logger.info(`Room updated successfully:${id}`);
      return res.status(200).json({ message: "Oda başarıyla güncellendi"});
      }catch(err){
        logger.error(`Error updating room: ${err.message}`);
        return res.status(500).json({ message: "Oda güncellenemedi"});
    }
  };

  const deleteRooms = async (req, res) => {
    const {id} = req.params;
    try {
      const result = await deleteRoomById(id);
      if(result.affectedRows === 0){
        return res.status(404).json({ message: "Oda bulunamadı" });
      }
      logger.info(`Room deleted successfully: ${id}`);
      return res.status(200).json({ message: "Oda başarıyla silindi"});
    }
    catch (err){
      logger.error(`Error deleting room: ${err.message}`);
      return res.status(500).json({ message: "Oda silinemedi"});
    }
    };
  
module.exports = {
  listRooms: listRoomsController,
  createRooms,
  updateRooms,
  deleteRooms
};
