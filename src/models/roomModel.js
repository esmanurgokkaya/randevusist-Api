const db = require("../config/db"); // kendi db bağlantı modülüne göre ayarla

const getAllRooms = async () => {
  const [rows] = await db.execute("SELECT * FROM rooms");
  return rows;
};

const createRoom = async (name, cover,status) => {
  const query = `
    INSERT INTO rooms (name, cover, status)
    VALUES (?, ?, ?)  
    `;
    const [result] = await db.execute(query,[name, cover, status]);
    return result;
};

const updateRoomById = async(id, name, cover, status) => {
  const query = `UPDATE rooms 
  SET name = ?, cover = ?, status = ? 
  WHERE id = ? `;

  const [result] = await db.execute(query, [name, cover, status, id]);
  return result;
};


const deleteRoomById = async (id) => {
  const query = 'DELETE FROM rooms WHERE id = ?';
  const [result] = await db.execute(query, [id]);
  return result;
};


module.exports = {
  getAllRooms,
  createRoom,
  updateRoomById,
  deleteRoomById,
};
