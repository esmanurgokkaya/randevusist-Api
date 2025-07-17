const db = require("../config/db"); 

/**
 * @desc Tüm rollerin listesini döner
 * @returns {Promise<Array>} - Tüm roller
 */
const getAllRoles = async () => {
  const [rows] = await db.execute("SELECT * FROM roles");
  return rows;
};

/**
 * @desc Yeni bir rol oluşturur
 * @param {string} name - Oluşturulacak rol adı
 * @returns {Promise<Object>} - Oluşturulan rol bilgisi
 */
const createRole = async (name) => {
  const query = `INSERT INTO roles (name) VALUES (?)`;
  const [result] = await db.execute(query, [name]);
  return result;
};

/**
 * @desc ID'ye göre rol adını günceller
 * @param {number} id - Güncellenecek rolün ID'si
 * @param {string} name - Yeni rol adı
 * @returns {Promise<Object>} - Güncelleme sonucu
 */
const updateRoleById = async (id, name) => {
  const query = `UPDATE roles SET name = ? WHERE id = ?`;
  const [result] = await db.execute(query, [name, id]);
  return result;
};

/**
 * @desc Belirtilen ID'ye sahip rolü siler
 * @param {number} id - Silinecek rolün ID'si
 * @returns {Promise<Object>} - Silme işleminin sonucu
 */
const deleteRoleById = async (id) => {
  const query = `DELETE FROM roles WHERE id = ?`;
  const [result] = await db.execute(query, [id]);
  return result;
};

module.exports = {
  getAllRoles,
  createRole,
  updateRoleById,
  deleteRoleById,
};
