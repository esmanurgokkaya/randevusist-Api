// express-jwt paketi ile JWT doğrulaması yapılır
const { expressjwt: jwt } = require("express-jwt");

// 🔐 Access token'ı doğrulayan middleware
// Kullanıcının gönderdiği JWT token'ı kontrol eder
// Eğer geçerliyse token'daki payload, req.auth içine yerleştirilir
const verifyToken = jwt({
  secret: process.env.JWT_SECRET,    // JWT doğrulamak için gizli anahtar (env dosyasından alınır)
  algorithms: ["HS256"],             // Kullanılan algoritma: HMAC SHA256
  requestProperty: "auth",           // Doğrulanan token bilgileri req.auth içine yazılır
});

// ❌ Token doğrulama sırasında bir hata oluşursa bunu yakalayan middleware
// Genellikle token geçersiz, süresi dolmuş ya da gönderilmemişse çalışır
const handleAuthError = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Yetkisiz erişim: Token geçersiz ya da eksik." });
  }
  next(err); // Hata JWT ile ilgili değilse diğer error handler'lara geçilir
};

// 🔐 Belirli bir role sahip kullanıcıların erişimine izin veren middleware
// Örnek: yalnızca admin rolüne sahip kullanıcılar için → requireRole('admin')
const requireRole = (role) => {
  return (req, res, next) => {
    // Token yoksa ya da token içindeki role alanı istenen rolle uyuşmuyorsa
    if (!req.auth || req.auth.role !== role) {
      return res.status(403).json({ message: `Bu işlem için ${role} yetkisi gerekir.` });
    }
    next(); // Rol uygun, işlemi devam ettir
  };
};

// 🔄 Birden fazla role izin veren esnek middleware
// Örnek: hem 'admin' hem de 'employee' rolü olanlar erişebilsin → requireAnyRole(['admin', 'employee'])
const requireAnyRole = (roles = []) => {
  return (req, res, next) => {
    // Token yoksa ya da rol dizisinde tanımlı roller arasında yoksa
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }
    next(); // Rollerden biri eşleşti, devam
  };
};

// Middleware'ler dışa aktarılır
module.exports = {
  verifyToken,       // JWT doğrulama
  handleAuthError,   // Hata yönetimi
  requireRole,       // Tek rol kontrolü
  requireAnyRole     // Çoklu rol kontrolü
};
