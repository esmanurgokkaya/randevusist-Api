const {
  findUserById,
  deleteUserById,
  updateUserById,
  isEmailTakenByAnotherUser
} = require('../models/userModels');

const argon2 = require('argon2');
const z = require('zod');

// --- 📌 Zod şeması: Kullanıcı profil güncelleme için doğrulama kuralları ---
const updateUserSchema = z.object({
  name: z.string().min(3, "İsim en az 3 karakter olmalı").optional(),
  lastname: z.string().min(2, "Soyisim en az 2 karakter olmalı").optional(),
  email: z.string().email("Geçerli bir e-posta girin").optional(),
  phone: z.string().optional(),
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
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile successfully retrieved
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

const getUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz erişim.' });

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

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
    console.error("Profil bilgileri alınırken hata:", err.stack || err.message);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete authenticated user's account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

const deleteUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz erişim.' });

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    await deleteUserById(userId);
    return res.json({ message: 'Hesap başarıyla silindi' });

  } catch (err) {
    console.error("Hesap silme hatası:", err.stack || err.message);
    return res.status(500).json({ message: 'Sunucu hatası: hesap silinemedi.' });
  }
};
/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "05551234567"
 *               oldPassword:
 *                 type: string
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 example: NewPass123!
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed or password missing
 *       401:
 *         description: Unauthorized or old password mismatch
 *       409:
 *         description: Email already taken
 *       500:
 *         description: Server error
 */

const updateUserProfile = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: 'Yetkisiz erişim.' });

  const validation = updateUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Geçersiz veri.',
      errors: validation.error.errors
    });
  }

  const data = validation.data;

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    let passwordToSave = user.password;

    if (data.oldPassword || data.newPassword) {
      if (!data.oldPassword || !data.newPassword) {
        return res.status(400).json({
          message: 'Parola değiştirmek için hem eski hem yeni parola gereklidir.'
        });
      }

      const match = await argon2.verify(user.password, data.oldPassword);
      if (!match) {
        return res.status(401).json({ message: 'Eski parola hatalı.' });
      }

      passwordToSave = await argon2.hash(data.newPassword);
    }
// burada belki mail değiştirmeye izin verilmeyebilir doğrulama kodu eklenebilir

    if (data.email && data.email !== user.email) {
      const existing = await isEmailTakenByAnotherUser(data.email, userId);
      if (existing) {
        return res.status(409).json({ message: 'Bu e-posta başka bir kullanıcıya ait.' });
      }
    }

    await updateUserById(
      userId,
      data.name ?? user.name,
      data.lastname ?? user.lastname,
      data.email ?? user.email,
      data.phone ?? user.phone,
      passwordToSave
    );

    return res.json({ message: 'Profil başarıyla güncellendi.' });

  } catch (err) {
    console.error("Güncelleme hatası:", err.stack || err.message);
    return res.status(500).json({ message: 'Sunucu hatası: profil güncellenemedi.' });
  }
};

module.exports = {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile,
};
