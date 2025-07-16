const {
  addPermissionToRole,
  removePermissionFromRole,
  getPermissionsByRoleId,
  getRolesByPermissionId,
} = require("../models/rolePermissionModel");
const logger = require("../utils/logger");

// Rolün tüm yetkilerini getir
const listPermissionsByRole = async (req, res) => {
  const { roleId } = req.params;
  try {
    const permissions = await getPermissionsByRoleId(roleId);
    logger.info(`Permissions fetched for role ${roleId}. Count: ${permissions.length}`);
    return res.json({ permissions });
  } catch (err) {
    logger.error(`Error fetching permissions for role ${roleId}: ${err.message}`);
    return res.status(500).json({ message: "Permissions could not be retrieved" });
  }
};

// Role yetki ekle
const addPermission = async (req, res) => {
  const { roleId, permissionId } = req.body;
  try {
    const result = await addPermissionToRole(roleId, permissionId);
    logger.info(`Permission ${permissionId} added to role ${roleId}`);
    return res.status(201).json({ message: "Permission added to role", result });
  } catch (err) {
    logger.error(`Error adding permission to role: ${err.message}`);
    return res.status(500).json({ message: "Could not add permission to role" });
  }
};

// Role yetki kaldır
const removePermission = async (req, res) => {
  const { roleId, permissionId } = req.body;
  try {
    const result = await removePermissionFromRole(roleId, permissionId);
    logger.info(`Permission ${permissionId} removed from role ${roleId}`);
    return res.json({ message: "Permission removed from role" });
  } catch (err) {
    logger.error(`Error removing permission from role: ${err.message}`);
    return res.status(500).json({ message: "Could not remove permission from role" });
  }
};

module.exports = {
  listPermissionsByRole,
  addPermission,
  removePermission,
};
