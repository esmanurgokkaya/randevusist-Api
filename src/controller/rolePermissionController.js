const {
  addPermissionToRole,
  removePermissionFromRole,
  getPermissionsByRoleId,
  getRolesByPermissionId,
} = require("../models/rolePermissionModel");
const logger = require("../utils/logger");

/**
 * @swagger
 * tags:
 *   name: RolePermissions
 *   description: Role and permission relationships
 */

/**
 * @swagger
 * /role-permissions/{roleId}:
 *   get:
 *     summary: Get all permissions assigned to a role
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         description: Role ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /role-permissions:
 *   post:
 *     summary: Assign a permission to a role
 *     tags: [RolePermissions]
 *     requestBody:
 *       description: Role and permission IDs
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionId
 *             properties:
 *               roleId:
 *                 type: integer
 *               permissionId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Permission assigned to role
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /role-permissions:
 *   delete:
 *     summary: Remove a permission from a role
 *     tags: [RolePermissions]
 *     requestBody:
 *       description: Role and permission IDs to remove
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionId
 *             properties:
 *               roleId:
 *                 type: integer
 *               permissionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Permission removed from role
 *       500:
 *         description: Server error
 */
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
