const {getAllPermissions, createPermission, updatePermissionById, deletePermissionById} = require("../models/permissionModel");
const logger = require("../utils/logger");

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission management
 */


/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: List of all permissions
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
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: view_users
 *       500:
 *         description: Server error while fetching permissions
 */

const listPermissions= async (req, res) => {
    try{
        const permissions = await getAllPermissions();
        logger.info(`Permissions fetched successfully. Count: ${permissions.length}`);
        return res.json({ permissions });
    }
    catch(err) {
        logger.error(`Error fetching permissions: ${err.message}`);
        return res.status(500).json({ message: "Permission data could not be retrieved" });
    }

};



/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     requestBody:
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
 *                 example: edit_users
 *     responses:
 *       201:
 *         description: Permission successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permission successfully created
 *                 permission:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: edit_users
 *       500:
 *         description: Server error while creating permission
 */
const createPermissions = async(req,res) => {
    const {name} = req.body;
    try{
        const result = await createPermission(name);
        logger.info(`Permission created successfully: ${name}`);
        return res.status(201).json({ message: "Permission successfully created", permission: result });

    }
    catch(err){
        logger.error(`Error creating permission: ${err.message}`);
        return res.status(500).json({ message: "Permission could not be created" });
    }
};

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Update a permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the permission to update
 *     requestBody:
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
 *                 example: manage_roles
 *     responses:
 *       200:
 *         description: Permission successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permission successfully updated
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error while updating permission
 */
const updatePermissions = async (req, res) => {
    const {id} = req.params;
    const {name} = req.body;
    try {
        const result = await updatePermissionById(id, name);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Permission not found" });
        }
        logger.info(`Permission updated successfully: ${name}`);
        return res.json({ message: "Permission successfully updated" });
    } catch (err) {
        logger.error(`Error updating permission: ${err.message}`);
        return res.status(500).json({ message: "Permission could not be updated" });
    }
};

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete a permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the permission to delete
 *     responses:
 *       200:
 *         description: Permission successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permission successfully deleted
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error while deleting permission
 */
const deletePermissions = async (req, res) => {
    const {id} = req.params;
    try {
        const result = await deletePermissionById(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Permission not found" });
        }
        logger.info(`Permission deleted successfully: ${id}`);
        return res.json({ message: "Permission successfully deleted" });
    } catch (err) {
        logger.error(`Error deleting permission: ${err.message}`);
        return res.status(500).json({ message: "Permission could not be deleted" });
    }
};

module.exports = {
    listPermissions,
    createPermissions,
    updatePermissions,
    deletePermissions,

};
