const authService = require('../services/auth.service');
const z = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string()
    .min(6)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/),
  role: z.enum(['user', 'admin', 'employee']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

exports.register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    res.status(201).json({ message: 'Kayıt başarılı', userId: user.id });
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı' });
    if (err.errors) return res.status(400).json({ message: 'Geçersiz veri', errors: err.errors });
    return res.status(500).json({ message: 'Sunucu hatası', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    res.json({
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
    if (err.message === 'INVALID_CREDENTIALS') return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
    return res.status(500).json({ message: 'Giriş hatası', error: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.refresh(token);
    res.json(result);
  } catch (err) {
    return res.status(403).json({ message: 'Token doğrulanamadı', error: err.message });
  }
};

exports.logout = async (req, res) => {
  const { token } = req.body;
  if (token) await authService.logout(token);
  res.json({ message: 'Çıkış başarılı' });
};
 