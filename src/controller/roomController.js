const {
  getAllRooms,
  createRoom,
  updateRoomById,
  deleteRoomById,
} = require("../models/roomModel");
const logger = require("../utils/logger");

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management operations
 */





/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [tr, en]
 *         description: Language for status translation
 *     responses:
 *       200:
 *         description: Successfully retrieved list of rooms
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
 *                       status:
 *                         type: string
 *                       name:
 *                         type: string
 *                       cover:
 *                         type: string
 *       500:
 *         description: Failed to retrieve rooms
 */
const listRooms = async (req, res) => {
  const locale = req.query.lang || 'tr';

  try {
    const rooms = await getAllRooms(locale);

    // Status için çeviri
    const statusTranslations = {
      tr: { available: "Uygun", maintenance: "Bakımda", closed: "Kapalı" },
      en: { available: "Available", maintenance: "Maintenance", closed: "Closed" },
    };

    const translatedRooms = rooms.map(room => ({
      ...room,
      status: statusTranslations[locale]?.[room.status] || room.status,
    }));

    logger.info(`Rooms fetched successfully. Count: ${translatedRooms.length}`);
    res.json({ rooms: translatedRooms });
  } catch (err) {
    logger.error(`Error fetching rooms: ${err.message}`);
    res.status(500).json({ message: "Oda verileri alınamadı" });
  }
};


/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, maintenance, closed]
 *               translations:
 *                 type: object
 *                 properties:
 *                   tr:
 *                     type: string
 *                   en:
 *                     type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 *       500:
 *         description: Failed to create room
 */

const createRooms = async (req, res) => {
  const { cover, status, translations } = req.body;
  /*
    translations örnek:
    {
      tr: "Oda 101",
      en: "Room 101"
    }
  */
  try {
    const result = await createRoom(cover, status, translations);
    logger.info(`Room created successfully: ${JSON.stringify(result)}`);
    res.status(201).json({ message: "Oda başarıyla oluşturuldu", room: result });
  } catch (err) {
    logger.error(`Error creating room: ${err.message}`);
    res.status(500).json({ message: "Oda oluşturulamadı" });
  }
};
/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, maintenance, closed]
 *               translations:
 *                 type: object
 *                 properties:
 *                   tr:
 *                     type: string
 *                   en:
 *                     type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Failed to update room
 */
const updateRooms = async (req, res) => {
  const { id } = req.params;
  const { cover, status, translations } = req.body;

  try {
    const result = await updateRoomById(id, cover, status, translations);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Oda bulunamadı" });
    }
    logger.info(`Room updated successfully: ${id}`);
    res.status(200).json({ message: "Oda başarıyla güncellendi" });
  } catch (err) {
    logger.error(`Error updating room: ${err.message}`);
    res.status(500).json({ message: "Oda güncellenemedi" });
  }
};
/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Failed to delete room
 */
const deleteRooms = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteRoomById(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Oda bulunamadı" });
    }
    logger.info(`Room deleted successfully: ${id}`);
    res.status(200).json({ message: "Oda başarıyla silindi" });
  } catch (err) {
    logger.error(`Error deleting room: ${err.message}`);
    res.status(500).json({ message: "Oda silinemedi" });
  }
};

module.exports = {
  listRooms,
  createRooms,
  updateRooms,
  deleteRooms,
};
