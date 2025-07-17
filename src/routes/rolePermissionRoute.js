const express = require("express");
const router = express.Router();
const {
  listPermissionsByRole,
  addPermission,
  removePermission
} = require("../controller/rolePermissionController");
const { verifyToken, checkPermission } = require("../middleware/authMiddleware");

/**
 * @route GET /api/role-permissions/:roleId
 * @desc Belirli bir role ait tüm izinleri getirir
 * @access Protected (manage_roles izni gerekli)
 */
router.get("/:roleId", verifyToken, checkPermission("manage_roles"), listPermissionsByRole);

/**
 * @route POST /api/role-permissions
 * @desc Role yeni bir izin ekler
 * @access Protected (manage_roles izni gerekli)
 */
router.post("/", verifyToken, checkPermission("manage_roles"), addPermission);

/**
 * @route DELETE /api/role-permissions
 * @desc Role ait bir izni kaldırır
 * @access Protected (manage_roles izni gerekli)
 */
router.delete("/", verifyToken, checkPermission("manage_roles"), removePermission);

module.exports = router;
