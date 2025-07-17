const db = require("../config/db");

/**
 * Tüm permission kayıtlarını getirir
 * @returns {Promise<Array>} - Permission nesneleri dizisi
 */
const getAllPermissions = async () => {
  const [rows] = await db.execute("SELECT * FROM permissions");
  return rows;
};

/**
 * Yeni bir permission kaydı oluşturur
 * @param {string} name - Oluşturulacak yetkinin adı
 * @returns {Promise<Object>} - MySQL işlem sonucu
 */
const createPermission = async (name) => {
  const query = `INSERT INTO permissions (name) VALUES (?)`;
  const [result] = await db.execute(query, [name]);
  return result;
};

/**
 * Belirli bir permission kaydını günceller
 * @param {number} id - Güncellenecek yetkinin ID'si
 * @param {string} name - Yeni yetki adı
 * @returns {Promise<Object>} - MySQL işlem sonucu
 */
const updatePermissionById = async (id, name) => {
  const query = `UPDATE permissions SET name = ? WHERE id = ?`;
  const [result] = await db.execute(query, [name, id]);
  return result;
};

/**
 * Belirli bir permission kaydını siler
 * @param {number} id - Silinecek yetkinin ID'si
 * @returns {Promise<Object>} - MySQL işlem sonucu
 */
const deletePermissionById = async (id) => {
  const query = `DELETE FROM permissions WHERE id = ?`;
  const [result] = await db.execute(query, [id]);
  return result;
};

module.exports = {
  getAllPermissions,
  createPermission,
  updatePermissionById,
  deletePermissionById,
};
