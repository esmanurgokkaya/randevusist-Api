const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const z = require("zod");
const {
  createUser,
  findUserByEmail
} = require("../models/userModels");
const {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken
} = require("../models/tokenModel");

// ✪ Zod register şeması
const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı."),
  lastname: z.string().min(2, "Soyisim en az 2 karakter olmalı."),
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  phone: z.string().min(10, "Telefon numarası geçersiz"),
  password: z.string()
    .min(6, "Şifre en az 6 karakter olmalı.")
    .regex(/[A-Z]/, "Parola en az bir büyük harf içermeli")
    .regex(/[a-z]/, "Parola en az bir küçük harf içermeli")
    .regex(/[0-9]/, "Parola en az bir rakam içermeli")
    .regex(/[!@#$%^&*]/, "Parola en az bir özel karakter içermeli (!@#$%^&*)"),
  role: z.enum(["user", "admin", "employee"]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await saveRefreshToken(user.id, token, expiresAt);
  return token;
};

// 🔐 Kullanıcı kaydı
const register = async (req, res) => {
  try {
    const {
      name,
      lastname,
      email,
      phone,
      password,
      role = "user"  // gelen role varsa al, yoksa "user"
    } = registerSchema.parse(req.body);

    const hashedPassword = await argon2.hash(password);
    const result = await createUser(name, lastname, email, phone, hashedPassword, role);

    return res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      userID: result.insertId
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Bu e-posta zaten kayıtlı." });
    }
    if (err.errors) {
      return res.status(400).json({ message: "Geçersiz veri.", errors: err.errors });
    }
    return res.status(500).json({ message: "Kayıt hatası", error: err.message });
  }
};

// 🔐 Kullanıcı girişi
const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await findUserByEmail(email);

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }
    console.log("hata burada mı1");
    const accessToken = generateAccessToken(user);
    console.log("hata burada mı2");

    const refreshToken = await generateRefreshToken(user);
    console.log("hata burada mı3");

    return res.json({
      message: "Giriş başarılı",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
      
    });
    
  } catch (error) {
    return res.status(500).json({ message: "Giriş hatası", error: error.message });
  }
};

// 🔄 Token yenileme
const refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token sağlanmadı" });

  try {
    const stored = await findRefreshToken(token);
    if (!stored) return res.status(403).json({ message: "Geçersiz veya silinmiş refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = { id: decoded.id, email: decoded.email };

    await deleteRefreshToken(token);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(403).json({ message: "Token doğrulanamadı", error: err.message });
  }
};

// 🔓 Çıkış
const logout = async (req, res) => {
  const { token } = req.body;
  if (token) await deleteRefreshToken(token);
  res.json({ message: "Çıkış başarılı" });
};

module.exports = {
  register,
  login,
  refresh,
  logout
};
