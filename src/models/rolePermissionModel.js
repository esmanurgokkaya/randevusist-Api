const db = require("../config/db"); 

/**
 * @desc Belirtilen role, belirtilen permission'ı ekler
 * @param {number} roleId - Rol ID'si
 * @param {number} permissionId - Eklenmek istenen yetki ID'si
 * @returns {Promise<Object>} - Ekleme işleminin sonucu
 */
const addPermissionToRole = async (roleId, permissionId) => {
  const query = `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`;
  const [result] = await db.execute(query, [roleId, permissionId]);
  return result;
};

/**
 * @desc Belirtilen role ait bir permission'ı kaldırır
 * @param {number} roleId - Rol ID'si
 * @param {number} permissionId - Kaldırılacak yetki ID'si
 * @returns {Promise<Object>} - Silme işleminin sonucu
 */
const removePermissionFromRole = async (roleId, permissionId) => {
  const query = `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`;
  const [result] = await db.execute(query, [roleId, permissionId]);
  return result;
};

/**
 * @desc Belirli bir role ait tüm permissionları getirir
 * @param {number} roleId - Rol ID'si
 * @returns {Promise<Array>} - Role ait yetki listesi
 */
const getPermissionsByRoleId = async (roleId) => {
  const query = `
    SELECT p.*
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = ?
  `;
  const [rows] = await db.execute(query, [roleId]);
  return rows;
};

/**
 * @desc Belirli bir permission'a sahip tüm rolleri getirir
 * @param {number} permissionId - Permission ID'si
 * @returns {Promise<Array>} - Permission'a sahip roller
 */
const getRolesByPermissionId = async (permissionId) => {
  const query = `
    SELECT r.*
    FROM roles r
    JOIN role_permissions rp ON r.id = rp.role_id
    WHERE rp.permission_id = ?
  `;
  const [rows] = await db.execute(query, [permissionId]);
  return rows;
};

module.exports = {
  addPermissionToRole,
  removePermissionFromRole,
  getPermissionsByRoleId,
  getRolesByPermissionId,
};
