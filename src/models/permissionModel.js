const db = require("../config/db");

const getAllPermissions = async () => {
  const [rows] = await db.execute("SELECT * FROM permissions");
  return rows;
};

const createPermission = async (name) => {
    const query = `INSERT INTO permissions (name) VALUES (?)`;
    const [result] = await db.execute(query, [name]);
    return result;
}

const  updatePermissionById = async (id, name) => {
    const query = `UPDATE permissions SET name = ? WHERE id = ?`;
    const [result] = await db.execute(query, [name, id]);
    return result;
}

const deletePermissionById = async (id) => {
    const query = `"DELETE FROM permissions WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
}

module.exports = {
    getAllPermissions,
    createPermission,
    updatePermissionById,
    deletePermissionById,
    
}