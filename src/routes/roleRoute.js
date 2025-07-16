const express = require("express");
const router = express.Router();
const {
  listRoles,
  createRoles,
  updateRoles,
  deleteRoles
} = require("../controller/roleController");
const { verifyToken, checkPermission } = require("../middleware/authMiddleware");

// /api/roles
router.get("/", verifyToken,  listRoles);
router.post("/", verifyToken, checkPermission("manage_roles"), createRoles);
router.put("/:id", verifyToken, checkPermission("update_roles"), updateRoles);
router.delete("/:id", verifyToken, checkPermission("delete_roles"), deleteRoles);

module.exports = router;
