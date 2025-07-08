const { success } = require('zod/v4'); // zod v4 modülünden success import edilmiş ama kullanılmıyor (gereksiz)
const authService = require('../services/auth.service');
const z = require('zod'); // Veri doğrulama kütüphanesi

// ✅ Kayıt formu doğrulama şeması
const registerSchema = z.object({
  name: z.string().min(2), // En az 2 karakterli isim
  lastname: z.string().min(2), // En az 2 karakterli soyisim
  email: z.string().email(), // Geçerli e-posta
  phone: z.string().min(10), // En az 10 karakterli telefon
  password: z.string() // Güçlü parola doğrulaması
    .min(6) // En az 6 karakter olmalı
    .regex(/[A-Z]/) // Büyük harf içermeli
    .regex(/[a-z]/) // Küçük harf içermeli
    .regex(/[0-9]/) // Rakam içermeli
    .regex(/[!@#$%^&*]/), // Özel karakter içermeli
  role: z.enum(['user', 'admin', 'employee']).optional() // Rol belirtilirse sadece bu değerlerden biri olabilir
});

// ✅ Giriş formu doğrulama şeması
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1) // Boş bırakılmamalı
});

// 📝 Kayıt işlemi
exports.register = async (req, res) => {
  try {
    // 🔍 Gelen veriyi şemaya göre kontrol et
    const data = registerSchema.parse(req.body);
    
    // ✅ authService üzerinden kayıt işlemi
    const user = await authService.register(data);

    res.status(201).json({ sucsess: true, message: 'Kayıt başarılı' });
  } catch (err) {
    // Eğer e-posta zaten varsa özel hata
    if (err.message === 'EMAIL_EXISTS')
      return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı' });

    // Eğer zod şeması hata döndürdüyse (validation)
    if (err.errors)
      return res.status(400).json({ message: 'Geçersiz veri', errors: err.errors });

    // Diğer hatalar
    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

// 🔐 Giriş işlemi
exports.login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body); // Form verilerini kontrol et

    // ✅ authService ile giriş denemesi
    const result = await authService.login(data.email, data.password);

    // Başarılı giriş yanıtı: token + kullanıcı bilgileri
    res.json({
      success: true,
      message: 'Giriş başarılı',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        lastname: result.user.lastname,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role
      }
    });
  } catch (err) {
    // Giriş bilgileri hatalıysa
    if (err.message === 'INVALID_CREDENTIALS')
      return res.status(401).json({ message: 'E-posta veya şifre hatalı' });

    return res.status(500).json({ message: 'Giriş hatası', error: err.message });
  }
};

// 🔄 Refresh Token ile yeni token üretme
exports.refresh = async (req, res) => {
  try {
    const { token } = req.body; // Eski refresh token alındı

    const result = await authService.refresh(token); // Yeni token'ları al

    res.json(result);
  } catch (err) {
    return res.status(403).json({ message: 'Token doğrulanamadı', error: err.message });
  }
};

// 🚪 Çıkış işlemi
exports.logout = async (req, res) => {
  const { token } = req.body;

  if (token) await authService.logout(token); // Refresh token'ı veritabanından sil

  res.json({ message: 'Çıkış başarılı' });
};
