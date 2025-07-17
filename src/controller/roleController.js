const { getAllRoles, createRole, updateRoleById, deleteRoleById } = require("../models/roleModel");
const logger = require("../utils/logger");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
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
const listRoles = async (req, res) => {
  try {
    const roles = await getAllRoles();
    logger.info(`Roles fetched successfully. Count: ${roles.length}`);
    return res.json({ roles });
  } catch (err) {
    logger.error(`Error fetching roles: ${err.message}`);
    return res.status(500).json({ message: "Role data could not be retrieved" });
  }
};

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       description: Role name
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role successfully created
 *       500:
 *         description: Server error
 */
const createRoles = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await createRole(name);
    logger.info(`Role created successfully: ${name}`);
    return res.status(201).json({ message: "Role successfully created", role: result });
  } catch (err) {
    logger.error(`Error creating role: ${err.message}`);
    return res.status(500).json({ message: "Role could not be created" });
  }
};

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Role ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: New role data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role successfully updated
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
const updateRoles = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await updateRoleById(id, name);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    logger.info(`Role updated successfully: ${name}`);
    return res.json({ message: "Role successfully updated" });
  } catch (err) {
    logger.error(`Error updating role: ${err.message}`);
    return res.status(500).json({ message: "Role could not be updated" });
  }
};

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Role ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role successfully deleted
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
const deleteRoles = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteRoleById(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    logger.info(`Role deleted successfully: ${id}`);
    return res.json({ message: "Role successfully deleted" });
  } catch (err) {
    logger.error(`Error deleting role: ${err.message}`);
    return res.status(500).json({ message: "Role could not be deleted" });
  }
};

module.exports = {
  listRoles,
  createRoles,
  updateRoles,
  deleteRoles,
};
