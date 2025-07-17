const express = require("express");
const router = express.Router();
const { listPermissions, createPermissions, updatePermissions, deletePermissions } = require("../controller/permissionController");
const { verifyToken, checkPermission } = require('../middleware/authMiddleware');

/**
 * @route GET /api/permissions
 * @desc Tüm yetkileri listeler
 * @access Protected (manage_permissions izni gerekli)
 */
router.get("/", verifyToken, checkPermission("manage_permissions"), listPermissions);

/**
 * @route POST /api/permissions
 * @desc Yeni yetki oluşturur
 * @access Protected (manage_users izni gerekli)
 */
router.post("/", verifyToken, checkPermission("manage_users"), createPermissions);

/**
 * @route PUT /api/permissions/:id
 * @desc Mevcut yetkiyi günceller
 * @access Protected (update_permissions izni gerekli)
 */
router.put("/:id", verifyToken, checkPermission("update_permissions"), updatePermissions);

/**
 * @route DELETE /api/permissions/:id
 * @desc Yetkiyi siler
 * @access Protected (delete_permissions izni gerekli)
 */
router.delete("/:id", verifyToken, checkPermission("delete_permissions"), deletePermissions);

module.exports = router;
