require("dotenv").config();
const logger = require("../utils/logger");
const { getUserPermissions } = require('../models/userModels');

const { expressjwt: jwt } = require("express-jwt");
// Access token kontrolü
const verifyToken = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
});

// Hataları yakala
const handleAuthError = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Yetkisiz erişim." });
  }
  next(err);
};


const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const permissions = await getUserPermissions(req.auth.id);
      if (!permissions.includes(permission)) {
        logger.warn(`Unauthorized access attempt: userId=${req.auth.id}, permission=${permission}`);
        return res.status(403).json({ message: "Yetkiniz yok" });
      }
      next();
    } catch (err) {
      console.error("Yetki kontrol hatası:", err);
      logger.error(`Permission check error: ${err.message}`);
      res.status(500).json({ message: "Yetki kontrol hatası" });
    }
  };
};


module.exports = {
  verifyToken,
  handleAuthError,
  checkPermission,
};
