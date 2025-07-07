const { getAllRooms } = require("../models/roomModel");

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
