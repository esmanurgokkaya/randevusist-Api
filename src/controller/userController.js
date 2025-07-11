const {
  findUserById,
  deleteUserById,
  updateUserById,
  isEmailTakenByAnotherUser,
  updateUserPasswordById
} = require('../models/userModels');
const logger = require("../utils/logger");

const argon2 = require('argon2');
const z = require('zod');

// --- 📌 Zod şeması: Kullanıcı profil güncelleme için doğrulama kuralları ---
const updateUserSchema = z.object({
  name: z.string().min(3, "İsim en az 3 karakter olmalı").optional(),
  lastname: z.string().min(2, "Soyisim en az 2 karakter olmalı").optional(),
  email: z.string().email("Geçerli bir e-posta girin").optional(),
  phone: z.string().optional(),
});

// şifre günceleme zod şeması
const passwordChangeSchema = z.object({
  oldPassword: z.string().min(6, "Eski parola en az 6 karakter olmalı"),
  newPassword: z.string()
    .min(6, "Yeni parola en az 6 karakter olmalı")
    .regex(/[A-Z]/, "Parola en az bir büyük harf içermeli")
    .regex(/[a-z]/, "Parola en az bir küçük harf içermeli")
    .regex(/[0-9]/, "Parola en az bir rakam içermeli")
    .regex(/[!@#$%^&*]/, "Parola en az bir özel karakter içermeli (!@#$%^&*)")
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
  if (!userId) {
    logger.warn("Unauthorized access attempt to get user profile.");
    return res.status(401).json({ message: 'Yetkisiz erişim.' });
  }
  try {
    const user = await findUserById(userId);
    if (!user) {
      logger.warn(`User profile not found: userId=${userId}`);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    logger.info(`User profile retrieved: userId=${userId}`);
    return res.json({
      message: 'Kullanıcı profili başarıyla getirildi.',
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id
      }
    });
  } catch (err) {
    logger.error(`Error retrieving user profile: ${err.stack || err.message}`);
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
  if (!userId) {
    logger.warn("Unauthorized access attempt to delete user profile.");
    return res.status(401).json({ message: 'Yetkisiz erişim.' });
  }
  try {
    const user = await findUserById(userId);
    if (!user) {
       logger.warn(`User to delete not found: userId=${userId}`);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    await deleteUserById(userId);
     logger.info(`User account deleted: userId=${userId}`);
    return res.json({ message: 'Hesap başarıyla silindi' });

  } catch (err) {
    logger.error(`Error deleting user account: ${err.stack || err.message}`);
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
 *             
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
  if (!userId) {
   logger.warn("Unauthorized access attempt to update profile."); 
    return res.status(401).json({ message: 'Yetkisiz erişim.' });
  }
  const validation = updateUserSchema.safeParse(req.body);
  if (!validation.success) {
    logger.warn("User profile update validation failed.");
    return res.status(400).json({
      message: 'Geçersiz veri.',
      errors: validation.error.errors
    });
  }

  const data = validation.data;

  try {
    const user = await findUserById(userId);
    if (!user) {
      logger.warn(`User not found for update: userId=${userId}`);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    
// burada belki mail değiştirmeye izin verilmeyebilir doğrulama kodu eklenebilir

    if (data.email && data.email !== user.email) {
      const existing = await isEmailTakenByAnotherUser(data.email, userId);
      if (existing) {
        ogger.warn(`Email already taken during profile update: email=${data.email}`);
        return res.status(409).json({ message: 'Bu e-posta başka bir kullanıcıya ait.' });
      }
    }

    await updateUserById(
      userId,
      data.name ?? user.name,
      data.lastname ?? user.lastname,
      data.email ?? user.email,
      data.phone ?? user.phone,
    );

    logger.info(`User profile updated successfully: userId=${userId}`);
    return res.json({ message: 'Profil başarıyla güncellendi.' });

  } catch (err) {
    logger.error(`Error updating profile: ${err.stack || err.message}`);
    return res.status(500).json({ message: 'Sunucu hatası: profil güncellenemedi.' });
  }
};
/**
 * @swagger
 * /users/me/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 example: NewPass456@
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized or wrong old password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

const changePassword = async (req, res) => {
  const userId = req.auth?.id;
  if (!userId) {
    logger.warn("Unauthorized access attempt to change password.");
    return res.status(401).json({ message: "Yetkisiz erişim." });
  }
  const validation = passwordChangeSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Geçersiz veri.",
      errors: validation.error.errors
    });
  }

  const { oldPassword, newPassword } = validation.data;

  try {
    const user = await findUserById(userId);
    if (!user) {
      logger.warn(`User not found for password change: userId=${userId}`);
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const match = await argon2.verify(user.password, oldPassword);
    if (!match) {
      logger.warn(`Old password mismatch for userId=${userId}`);
      return res.status(401).json({ message: "Eski parola hatalı." });
    }

    const hashedPassword = await argon2.hash(newPassword);
    await updateUserPasswordById(
      userId,
      hashedPassword
    );
    logger.info(`Password updated successfully for userId=${userId}`);
    return res.json({ message: "Parola başarıyla güncellendi." });
  } catch (err) {
    logger.error(`Password update error: ${err.stack || err.message}`);
    return res.status(500).json({ message: "Sunucu hatası: parola güncellenemedi." });
  }
};


module.exports = {
  getUserProfile,
  deleteUserProfile,
  updateUserProfile,
  changePassword,
};
