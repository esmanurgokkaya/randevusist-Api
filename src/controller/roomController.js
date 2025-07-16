const {
  getAllRooms,
  createRoom,
  updateRoomById,
  deleteRoomById,
} = require("../models/roomModel");
const logger = require("../utils/logger");

const listRooms = async (req, res) => {
  const locale = req.query.lang || "tr";

  try {
    const rooms = await getAllRooms();

    const statusTranslations = {
      tr: { available: "Uygun", maintenance: "Bakımda", closed: "Kapalı" },
      en: { available: "Available", maintenance: "Maintenance", closed: "Closed" },
    };

    const translatedRooms = rooms.map((room) => {
      let nameObj = {};

      if (typeof room.name === "string") {
        try {
          nameObj = JSON.parse(room.name);
        } catch (e) {
          nameObj = { tr: room.name };
        }
      } else if (typeof room.name === "object" && room.name !== null) {
        nameObj = room.name;
      } else {
        nameObj = { tr: "" };
      }

      return {
        ...room,
        name: nameObj[locale] || nameObj["tr"] || "",
        status: statusTranslations[locale]?.[room.status.toLowerCase()] || room.status,
      };
    });

    logger.info(`Rooms fetched successfully. Count: ${translatedRooms.length}`);
    res.json({ rooms: translatedRooms });
  } catch (err) {
    logger.error(`Error fetching rooms: ${err.message}`);
    res.status(500).json({ message: "Oda verileri alınamadı" });
  }
};

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
