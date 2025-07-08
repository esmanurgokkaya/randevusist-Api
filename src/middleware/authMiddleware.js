const { expressjwt: jwt } = require("express-jwt");

// 🔐 Access token doğrulama
const verifyToken = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth", // req.auth altında taşınır
});

// ❌ Hata yakalayıcı
const handleAuthError = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Yetkisiz erişim: Token geçersiz ya da eksik." });
  }
  next(err);
};

// 🔐 Belirli rolü gerektiren işlemler için middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.auth || req.auth.role !== role) {
      return res.status(403).json({ message: `Bu işlem için ${role} yetkisi gerekir.` });
    }
    next();
  };
};

// 🔄 Birden fazla rol kabul eden flexible middleware (opsiyonel)
const requireAnyRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  handleAuthError,
  requireRole,       // Tek rol: örnek → requireRole('admin')
  requireAnyRole     // Çoklu rol: örnek → requireAnyRole(['admin', 'employee'])
};
