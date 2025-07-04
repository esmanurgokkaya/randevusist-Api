const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { createUser, findUserByEmail } = require('../models/userModels.js');
const z = require('zod');

// --- Zod Şemaları ---

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(100),
  password: z.string()
    .min(6)
    .max(255)
    .regex(/[a-z]/, "Parola en az bir küçük harf içermeli.")
    .regex(/[A-Z]/, "Parola en az bir büyük harf içermeli.")
    .regex(/[0-9]/, "Parola en az bir rakam içermeli.")
    .regex(/[^a-zA-Z0-9]/, "Parola en az bir özel karakter içermeli."),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Parola boş bırakılamaz.")
});

// --- Controller Fonksiyonları ---

const register = async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const hashedPassword = await argon2.hash(password);

    try {
      const result = await createUser(username, email, hashedPassword);
      return res.status(201).json({
        message: 'Kullanıcı başarıyla oluşturuldu.',
        userID: result.insertId
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
      }
      console.error("Kullanıcı oluşturulurken veritabanı hatası:", err);
      return res.status(500).json({ message: 'Kullanıcı oluşturulamadı', error: err.message });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Doğrulama hatası.',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    console.error("Kayıt sırasında beklenmeyen hata:", error);
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await findUserByEmail(email);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const user = result[0];
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return res.status(400).json({ message: 'E-posta veya parola hatalı.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Doğrulama hatası.',
        errors: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
      });
    }
    console.error("Giriş sırasında beklenmeyen hata:", error);
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

module.exports = {
  register,
  login
};
