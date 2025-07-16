const db = require("../config/db");

const getAllRoles = async () => {
  const [rows] = await db.execute("SELECT * FROM roles");
  return rows;
};

const createRole = async (name) => {
  const query = `INSERT INTO roles (name) VALUES (?)`;
  const [result] = await db.execute(query, [name]);
  return result;
};

const updateRoleById = async (id, name) => {
  const query = `UPDATE roles SET name = ? WHERE id = ?`;
  const [result] = await db.execute(query, [name, id]);
  return result;
};

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

