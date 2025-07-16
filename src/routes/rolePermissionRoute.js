const express = require("express");
const router = express.Router();
const {
  listPermissionsByRole,
  addPermission,
  removePermission
} = require("../controller/rolePermissionController");
const { verifyToken, checkPermission } = require("../middleware/authMiddleware");

// /api/role-permissions/:roleId → Belirli role ait izinleri getir
router.get("/:roleId", verifyToken, checkPermission("manage_roles"), listPermissionsByRole);

// /api/role-permissions → Role izin ekle
router.post("/", verifyToken, checkPermission("manage_roles"), addPermission);

// /api/role-permissions → Role izni kaldır
router.delete("/", verifyToken, checkPermission("manage_roles"), removePermission);

module.exports = router;
