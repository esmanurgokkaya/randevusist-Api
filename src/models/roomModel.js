const db = require("../config/db");

/**
 * Tüm odaları getirir
 */
const getAllRooms = async () => {
  const query = `SELECT id, name, cover, status FROM rooms`;
  const [rows] = await db.execute(query);
  return rows;
};

/**
 * Yeni oda oluşturur
 * @param {string} cover 
 * @param {string} status 
 * @param {Object} translations - Ör: { tr: "Oda 101", en: "Room 101" }
 */
const createRoom = async (cover, status, translations) => {
  const nameJson = JSON.stringify(translations);

  const [result] = await db.execute(
    `INSERT INTO rooms (name, cover, status) VALUES (?, ?, ?)`,
    [nameJson, cover, status]
  );

  return { id: result.insertId, name: translations, cover, status };
};

/**
 * Odayı günceller
 * @param {number} id 
 * @param {string} cover 
 * @param {string} status 
 * @param {Object} translations 
 */
const updateRoomById = async (id, cover, status, translations) => {
  const nameJson = JSON.stringify(translations);

  const [result] = await db.execute(
    `UPDATE rooms SET name = ?, cover = ?, status = ? WHERE id = ?`,
    [nameJson, cover, status, id]
  );

  return result;
};

/**
 * Odayı siler
 * @param {number} id 
 */
const deleteRoomById = async (id) => {
  const [result] = await db.execute(`DELETE FROM rooms WHERE id = ?`, [id]);
  return result;
};

module.exports = {
  getAllRooms,
  createRoom,
  updateRoomById,
  deleteRoomById,
};
