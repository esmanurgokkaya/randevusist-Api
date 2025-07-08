// Gerekli servis ve doğrulama kütüphanesi içe aktarılıyor
const userService = require('../services/user.service');
const z = require('zod');

// Kullanıcı profil güncelleme işlemleri için Zod doğrulama şeması tanımlanıyor
// Bu şema, frontend'den gelen verilerin doğruluğunu kontrol eder
const updateUserSchema = z.object({
  name: z.string().min(3).optional(),        // En az 3 karakterli, opsiyonel isim
  lastname: z.string().min(2).optional(),    // En az 2 karakterli, opsiyonel soyisim
  email: z.string().email().optional(),      // Geçerli e-posta formatı, opsiyonel
  phone: z.string().optional(),              // Telefon numarası (herhangi bir string olabilir), opsiyonel
  oldPassword: z.string().min(6).optional(), // Şifre değiştirmek istenirse eski şifre gerekli
  newPassword: z.string()                    // Yeni şifre belirli kurallara uymalı
    .min(6)
    .regex(/[A-Z]/)                          // En az bir büyük harf
    .regex(/[a-z]/)                          // En az bir küçük harf
    .regex(/[0-9]/)                          // En az bir rakam
    .regex(/[!@#$%^&*]/)                     // En az bir özel karakter
    .optional(),
});


// 👤 Kullanıcının kendi profilini getirme endpoint'i
exports.getUserProfile = async (req, res) => {
  try {
    // Auth middleware'den gelen kullanıcı ID'si kullanılarak veri çekilir
    const user = await userService.getUserProfile(req.auth.id);

    // Kullanıcı bulunduysa bilgileri geri döner
    return res.json({
      message: 'Kullanıcı profili başarıyla getirildi.',
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    // Kullanıcı bulunamazsa özel hata mesajı döner
    if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    // Diğer tüm hatalar için genel sunucu hatası mesajı
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


// ❌ Kullanıcı hesabını silme endpoint’i
exports.deleteUserProfile = async (req, res) => {
  try {
    // Auth middleware’den gelen kullanıcı ID ile servis katmanına silme talebi gönderilir
    await userService.deleteUserProfile(req.auth.id);
    
    // Başarılı silme sonrası mesaj
    return res.json({ message: 'Hesap başarıyla silindi.' });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


// 📝 Kullanıcı bilgilerini güncelleme endpoint’i
exports.updateUserProfile = async (req, res) => {
  // Gelen veriler Zod ile validasyondan geçirilir
  const validation = updateUserSchema.safeParse(req.body);
  
  // Eğer doğrulama başarısızsa 400 Bad Request ve hatalar döner
  if (!validation.success) {
    return res.status(400).json({ message: 'Geçersiz veri.', errors: validation.error.errors });
  }

  try {
    // Validasyonu geçen verilerle servis katmanından güncelleme yapılır
    await userService.updateUserProfile(req.auth.id, validation.data);

    // Başarılı güncelleme sonrası kullanıcıya bilgi verilir
    return res.json({ message: 'Profil başarıyla güncellendi.' });
  } catch (err) {
    // Belirli hata senaryoları ayrı ayrı ele alınır ve uygun HTTP kodlarıyla döner
    if (err.message === 'NOT_FOUND')
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (err.message === 'OLD_PASSWORD_INCORRECT')
      return res.status(401).json({ message: 'Eski parola hatalı.' });

    if (err.message === 'PASSWORD_BOTH_REQUIRED')
      return res.status(400).json({ message: 'Parola değişimi için eski ve yeni parolayı girin.' });

    if (err.message === 'EMAIL_ALREADY_USED')
      return res.status(409).json({ message: 'Bu e-posta başka kullanıcıya ait.' });

    // Diğer beklenmeyen hatalarda genel mesaj
    return res.status(500).json({ message: 'Sunucu hatası: profil güncellenemedi.' });
  }
};
