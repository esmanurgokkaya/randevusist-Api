const db = require("../config/db");

// Role'a permission ekle
const addPermissionToRole = async (roleId, permissionId) => {
  const query = `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`;
  const [result] = await db.execute(query, [roleId, permissionId]);
  return result;
};

// Role'dan permission kaldır
const removePermissionFromRole = async (roleId, permissionId) => {
  const query = `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`;
  const [result] = await db.execute(query, [roleId, permissionId]);
  return result;
};

// Role'un tüm permissionlarını getir
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

// Bir permission'a sahip roller (isteğe bağlı)
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
