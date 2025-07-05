const {
  findUserById,
  deleteUserById,
  updateUserById,
  isEmailTakenByAnotherUser
} = require('../models/userModels');

const argon2 = require('argon2');
const z = require('zod');

// --- 📌 Zod Şeması ---
/**
 * Kullanıcı güncelleme işlemi için isteğin doğrulanacağı alanlar
 */
const updateUserSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı").optional(),
  email: z.string().email("Geçerli bir e-posta girin").optional(),
  oldPassword: z.string().min(6, "Eski parola en az 6 karakter olmalı").optional(),
  newPassword: z.string()
    .min(6, "Yeni parola en az 6 karakter olmalı")
    .regex(/[A-Z]/, "Parola en az bir büyük harf içermeli")
    .regex(/[a-z]/, "Parola en az bir küçük harf içermeli")
    .regex(/[0-9]/, "Parola en az bir rakam içermeli")
    .regex(/[!@#$%^&*]/, "Parola en az bir özel karakter içermeli (!@#$%^&*)")
    .optional(),
});

/**
 * @desc   Kullanıcının profil bilgilerini döndürür
 * @route  GET /api/user/profile
 * @access Protected
 */
const getUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz erişim.' });

  try {
    const results = await findUserById(userId);
    if (!results?.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const user = results[0];

    return res.json({
      message: 'Kullanıcı profili başarıyla getirildi.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Profil bilgileri alınırken hata:", err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * @desc   Kullanıcının hesabını siler
 * @route  DELETE /api/user/profile
 * @access Protected
 */
const deleteUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz erişim.' });

  try {
    const results = await findUserById(userId);
    if (!results?.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    await deleteUserById(userId);
    return res.json({ message: 'Hesap başarıyla silindi' });

  } catch (err) {
    console.error("Hesap silme hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası: hesap silinemedi.' });
  }
};

/**
 * @desc   Kullanıcı bilgilerini günceller (opsiyonel olarak parola değişikliği yapılabilir)
 * @route  PUT /api/user/profile
 * @access Protected
 */
const updateUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz erişim.' });

  // Gelen veriyi şemaya göre kontrol et
  const validation = updateUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Geçersiz veri.',
      errors: validation.error.errors
    });
  }

  const data = validation.data;

  try {
    const results = await findUserById(userId);
    if (!results?.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const user = results[0];
    let passwordToSave = user.password;

    // --- Şifre değiştirme işlemi varsa ---
    if (data.oldPassword || data.newPassword) {
      // Her iki parola da sağlanmalı
      if (!data.oldPassword || !data.newPassword) {
        return res.status(400).json({
          message: 'Parola değiştirmek için hem eski hem yeni parola gereklidir.'
        });
      }

      // Eski parolayı kontrol et
      const match = await argon2.verify(user.password, data.oldPassword);
      if (!match) {
        return res.status(401).json({ message: 'Eski parola hatalı.' });
      }

      // Yeni parolayı hashle
      passwordToSave = await argon2.hash(data.newPassword);
    }

    // --- E-posta benzersiz mi kontrol et ---
    if (data.email && data.email !== user.email) {
      const existing = await isEmailTakenByAnotherUser(data.email, userId);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Bu e-posta başka bir kullanıcıya ait.' });
      }
    }

    // --- Veritabanını güncelle ---
    await updateUserById(
      userId,
      data.username ?? user.username,
      data.email ?? user.email,
      passwordToSave
    );

    return res.json({ message: 'Profil başarıyla güncellendi.' });

  } catch (err) {
    console.error("Güncelleme hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası: profil güncellenemedi.' });
  }
};

// --- 📦 Export ---
module.exports = {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile,
};