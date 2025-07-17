const express = require("express");
const router = express.Router();
const {
  listRoles,
  createRoles,
  updateRoles,
  deleteRoles
} = require("../controller/roleController");
const { verifyToken, checkPermission } = require("../middleware/authMiddleware");

/**
 * @route GET /api/roles
 * @desc Tüm rollerin listesini döner
 * @access Protected (yetki gerekmiyor)
 */
router.get("/", verifyToken, listRoles);

/**
 * @route POST /api/roles
 * @desc Yeni rol oluşturur
 * @access Protected (manage_roles izni gerekli)
 */
router.post("/", verifyToken, checkPermission("manage_roles"), createRoles);

/**
 * @route PUT /api/roles/:id
 * @desc Belirtilen ID'ye sahip rolü günceller
 * @access Protected (update_roles izni gerekli)
 */
router.put("/:id", verifyToken, checkPermission("update_roles"), updateRoles);

/**
 * @route DELETE /api/roles/:id
 * @desc Belirtilen ID'ye sahip rolü siler
 * @access Protected (delete_roles izni gerekli)
 */
router.delete("/:id", verifyToken, checkPermission("delete_roles"), deleteRoles);

module.exports = router;
