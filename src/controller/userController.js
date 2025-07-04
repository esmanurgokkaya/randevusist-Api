// Gerekli modelleri ve bağımlılıkları içe aktar
const {
  findUserById,
  deleteUserById,
  updateUserById,
  isEmailTakenByAnotherUser
} = require('../models/userModels');

const argon2 = require('argon2');
const z = require('zod');

// Kullanıcı güncelleme işlemleri için istek doğrulama şeması
const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  oldPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});

/**
 * @desc   Kullanıcının profil bilgilerini döndürür
 * @route  GET /api/user/profile
 * @access Protected
 */
const getUserProfile = (req, res) => {
  const userId = req.auth?.id;

  if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });

  findUserById(userId, (err, userDetails) => {
    if (err) {
      console.error("Profil bilgileri çekilirken veritabanı hatası:", err);
      return res.status(500).json({ message: 'Sunucu hatası.' });
    }

    if (!userDetails?.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const user = userDetails[0];

    return res.json({
      message: 'Kullanıcı profili başarıyla getirildi.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
};

/**
 * @desc   Kullanıcı hesabını siler
 * @route  DELETE /api/user/profile
 * @access Protected
 */
const deleteUserProfile = async (req, res) => {
  const userId = req.auth?.id;

  if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });

  findUserById(userId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Sunucu hatası' });

    if (!results?.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    deleteUserById(userId, (err) => {
      if (err) return res.status(500).json({ message: 'Hesap silinemedi' });

      return res.json({ message: 'Hesap başarıyla silindi' });
    });
  });
};

/**
 * @desc   Kullanıcı bilgilerini günceller
 * @route  PUT /api/user/profile
 * @access Protected
 */
const updateUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  const updatedData = req.body;

  if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });

  // Gelen veriyi Zod ile doğrula
  const validation = updateUserSchema.safeParse(updatedData);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Geçersiz veri',
      errors: validation.error.errors
    });
  }

  // Kullanıcıyı veritabanından bul
  findUserById(userId, async (err, results) => {
    if (err) return res.status(500).json({ message: 'Veritabanı hatası' });
    if (!results?.length) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    const user = results[0];

    // Güncelleme işlemini gerçekleştiren yardımcı fonksiyon
    const proceed = async () => {
      try {
        // 1. Başlangıçta güncellenecek şifre mevcut kullanıcı şifresi olarak belirlenir
        let passwordToSave = user.password;

        // 2. Kullanıcı şifre değiştirmek istiyorsa bu blok çalışır
        if (updatedData.oldPassword || updatedData.newPassword) {

          // 3. Eğer sadece biri geldiyse (ya eski ya yeni) eksik veri hatası ver
          if (!updatedData.oldPassword || !updatedData.newPassword) {
            return res.status(400).json({
              message: 'Parola değiştirmek için hem eski hem yeni parola gereklidir.'
            });
          }

          // 4. Kullanıcının eski şifresi doğru mu? Argon2 hash verify işlemi yapılır
          const match = await argon2.verify(user.password, updatedData.oldPassword);

          // 5. Şifre eşleşmezse yetkisiz hatası döner
          if (!match) {
            return res.status(401).json({
              message: 'Eski parola hatalı.'
            });
          }

          // 6. Yeni şifre hash’lenerek kaydedilmek üzere hazırlanır
          passwordToSave = await argon2.hash(updatedData.newPassword);
        }

        // 7. Kullanıcı verilerini veritabanında güncelle
        //    Eğer kullanıcı yeni bir username veya email verdiyse onu kullan, yoksa mevcut olanı bırak
        updateUserById(
          userId,
          updatedData.username || user.username,
          updatedData.email || user.email,
          passwordToSave, // Bu şifre ya aynı kaldı ya da yeni hash’lendi
          (err) => {
            if (err) {
              return res.status(500).json({
                message: 'Güncelleme sırasında hata oluştu.'
              });
            }

            // 8. Başarıyla güncellendiğinde kullanıcıya bilgi verilir
            return res.json({
              message: 'Profil başarıyla güncellendi.'
            });
          }
        );

      } catch (e) {
        // 9. Argon2, async işlemler ya da veritabanı hatası gibi durumlarda burası çalışır
        console.error(e);
        return res.status(500).json({
          message: 'Parola işlemlerinde hata oluştu.'
        });
      }
    };


    // E-posta değişikliği varsa, çakışma kontrolü yap
    if (updatedData.email && updatedData.email !== user.email) {
      isEmailTakenByAnotherUser(updatedData.email, userId, (err, existing) => {
        if (err) return res.status(500).json({ message: 'Veritabanı hatası' });
        if (existing.length > 0) {
          return res.status(409).json({ message: 'Bu e-posta başka bir kullanıcıya ait.' });
        }
        proceed();
      });
    } else {
      proceed();
    }
  });
};

// Controller'ları dışa aktar
module.exports = {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile,
};
