// Gerekli servis ve doğrulama kütüphanesi içe aktarılıyor
const userService = require('../services/user.service');
const z = require('zod');

// Kullanıcı profil güncelleme işlemleri için Zod doğrulama şeması tanımlanıyor
const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  lastname: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  oldPassword: z.string().min(6).optional(),
  newPassword: z.string()
    .min(6)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/)
    .optional(),
});

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Kullanıcı işlemleri (profil görüntüleme, güncelleme, silme)
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Kullanıcı profilini getir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili getirildi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.auth.id);
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
    if (err.message === 'NOT_FOUND')
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Kullanıcı hesabını sil
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hesap başarıyla silindi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
exports.deleteUserProfile = async (req, res) => {
  try {
    await userService.deleteUserProfile(req.auth.id);
    return res.json({ message: 'Hesap başarıyla silindi.' });
  } catch (err) {
    if (err.message === 'NOT_FOUND')
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Kullanıcı profilini güncelle
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
 *               name: { type: string }
 *               lastname: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri veya eksik parola bilgisi
 *       401:
 *         description: Eski parola hatalı
 *       404:
 *         description: Kullanıcı bulunamadı
 *       409:
 *         description: Bu e-posta başka kullanıcıya ait
 *       500:
 *         description: Profil güncellenemedi
 */
exports.updateUserProfile = async (req, res) => {
  const validation = updateUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ message: 'Geçersiz veri.', errors: validation.error.errors });
  }

  try {
    await userService.updateUserProfile(req.auth.id, validation.data);
    return res.json({ message: 'Profil başarıyla güncellendi.' });
  } catch (err) {
    if (err.message === 'NOT_FOUND')
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (err.message === 'OLD_PASSWORD_INCORRECT')
      return res.status(401).json({ message: 'Eski parola hatalı.' });

    if (err.message === 'PASSWORD_BOTH_REQUIRED')
      return res.status(400).json({ message: 'Parola değişimi için eski ve yeni parolayı girin.' });

    if (err.message === 'EMAIL_ALREADY_USED')
      return res.status(409).json({ message: 'Bu e-posta başka kullanıcıya ait.' });

    return res.status(500).json({ message: 'Sunucu hatası: profil güncellenemedi.' });
  }
};
