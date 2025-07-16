const { getAllRoles, createRole, updateRoleById, deleteRoleById } = require("../models/roleModel");
const logger = require("../utils/logger");

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
