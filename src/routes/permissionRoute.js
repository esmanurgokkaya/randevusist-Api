const express = require("express");
const router = express.Router();
const {listPermissions, createPermissions, updatePermissions, deletePermissions} = require("../controller/permissionController");
const { verifyToken, checkPermission } = require('../middleware/authMiddleware');

router.get("/", verifyToken, checkPermission("manage_permissions"), listPermissions); // /api/permissions
router.post("/", verifyToken, checkPermission("manage_users"), createPermissions); // /api/permissions
router.put("/:id", verifyToken, checkPermission("update_permissions"), updatePermissions); // /api/permissions/:id
router.delete("/:id", verifyToken, checkPermission("delete_permissions"), deletePermissions); // /api/permissions/:id       

module.exports = router;