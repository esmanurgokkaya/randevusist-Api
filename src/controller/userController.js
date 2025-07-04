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
const getUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });

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
    console.error("Profil bilgileri çekilirken veritabanı hatası:", err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * @desc   Kullanıcı hesabını siler
 * @route  DELETE /api/user/profile
 * @access Protected
 */
const deleteUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz.' });

  try {
    const results = await findUserById(userId);
    if (!results?.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    await deleteUserById(userId);
    return res.json({ message: 'Hesap başarıyla silindi' });
  } catch (err) {
    console.error("Hesap silme hatası:", err);
    return res.status(500).json({ message: 'Hesap silinemedi' });
  }
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

  const validation = updateUserSchema.safeParse(updatedData);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Geçersiz veri',
      errors: validation.error.errors
    });
  }

  try {
    const results = await findUserById(userId);
    if (!results?.length) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    const user = results[0];
    let passwordToSave = user.password;

    if (updatedData.oldPassword || updatedData.newPassword) {
      if (!updatedData.oldPassword || !updatedData.newPassword) {
        return res.status(400).json({
          message: 'Parola değiştirmek için hem eski hem yeni parola gereklidir.'
        });
      }

      const match = await argon2.verify(user.password, updatedData.oldPassword);
      if (!match) {
        return res.status(401).json({ message: 'Eski parola hatalı.' });
      }

      passwordToSave = await argon2.hash(updatedData.newPassword);
    }

    if (updatedData.email && updatedData.email !== user.email) {
      const existing = await isEmailTakenByAnotherUser(updatedData.email, userId);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Bu e-posta başka bir kullanıcıya ait.' });
      }
    }

    await updateUserById(
      userId,
      updatedData.username || user.username,
      updatedData.email || user.email,
      passwordToSave
    );

    return res.json({ message: 'Profil başarıyla güncellendi.' });

  } catch (err) {
    console.error("Güncelleme hatası:", err);
    return res.status(500).json({ message: 'Parola işlemlerinde ya da güncellemede hata oluştu.' });
  }
};

module.exports = {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile,
};
