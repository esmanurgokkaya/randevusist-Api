const db = require("../config/db"); // kendi db bağlantı modülüne göre ayarla

const getAllRooms = async () => {
  const [rows] = await db.execute("SELECT * FROM rooms");
  return rows;
};

module.exports = {
  getAllRooms,
};
