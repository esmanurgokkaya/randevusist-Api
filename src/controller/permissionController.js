const {getAllPermissions, createPermission, updatePermissionById, deletePermissionById} = require("../models/permissionModel");
const { get } = require("../routes/userRoute");
const logger = require("../utils/logger");


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
}

module.exports = {
    listPermissions,
    createPermissions,
    updatePermissions,
    deletePermissions,

};
