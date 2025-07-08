const authService = require('../services/auth.service');
const z = require('zod');

// ✅ Kayıt doğrulama şeması
const registerSchema = z.object({
  name: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string()
    .min(6)
    .regex(/[A-Z]/, "En az 1 büyük harf içermeli")
    .regex(/[a-z]/, "En az 1 küçük harf içermeli")
    .regex(/[0-9]/, "En az 1 rakam içermeli")
    .regex(/[!@#$%^&*]/, "En az 1 özel karakter içermeli"),
  role: z.enum(['user', 'admin', 'employee']).optional()
});

// ✅ Giriş doğrulama şeması
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kimlik doğrulama işlemleri
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lastname, email, phone, password]
 *             properties:
 *               name: { type: string }
 *               lastname: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [user, admin, employee] }
 *     responses:
 *       201:
 *         description: Kayıt başarılı
 *       409:
 *         description: E-posta zaten kayıtlı
 */
exports.register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    await authService.register(data);

    res.status(201).json({ success: true, message: 'Kayıt başarılı' });
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı' });
    }

    if (err.errors) {
      return res.status(400).json({ message: 'Geçersiz veri', errors: err.errors });
    }

    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Giriş başarılı (token ile birlikte)
 *       401:
 *         description: E-posta veya şifre hatalı
 */
exports.login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);

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
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
    }

    return res.status(500).json({ message: 'Giriş hatası', error: err.message });
  }
};

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Yeni token al (refresh token ile)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Yeni token üretildi
 *       403:
 *         description: Token geçersiz
 */
exports.refresh = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.refresh(token);
    res.json(result);
  } catch (err) {
    return res.status(403).json({ message: 'Token doğrulanamadı', error: err.message });
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Oturumu kapat
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Çıkış başarılı
 */
exports.logout = async (req, res) => {
  const { token } = req.body;
  if (token) await authService.logout(token);
  res.json({ message: 'Çıkış başarılı' });
};
