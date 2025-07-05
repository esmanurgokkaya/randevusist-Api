const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const z = require("zod");
const { createUser, findUserByEmail } = require("../models/userModels");
const { saveRefreshToken, findRefreshToken, deleteRefreshToken } = require("../models/tokenModel");

// 📌 Kayıt için Zod doğrulama şeması
const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı."),
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı.")
});

// 📌 Giriş için Zod doğrulama şeması
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// 🔐 JWT access token üret
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Kısa süreli access token
  );
};

// 🔐 JWT refresh token üret ve veritabanına kaydet
const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün sonrası
  await saveRefreshToken(user.id, token, expiresAt);
  return token;
};

// 🧾 Kullanıcı kayıt
const register = async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const hashedPassword = await argon2.hash(password);

    const result = await createUser(username, email, hashedPassword);
    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      userID: result.insertId
    });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Bu e-posta zaten kayıtlı." });
    }

    return res.status(500).json({ message: "Kayıt hatası", error: err.message });
  }
};

// 🔑 Kullanıcı girişi
const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await findUserByEmail(email);

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return res.json({
      message: "Giriş başarılı",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({ message: "Giriş hatası", error: error.message });
  }
};

// 🔄 Refresh token ile access token yenile
const refresh = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token sağlanmadı" });
  }

  try {
    const stored = await findRefreshToken(token);
    if (!stored) {
      return res.status(403).json({ message: "Geçersiz veya silinmiş refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = { id: decoded.id, email: decoded.email };

    await deleteRefreshToken(token); // eski token'ı sil
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user); // yenisini kaydet

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    return res.status(403).json({ message: "Token doğrulanamadı", error: err.message });
  }
};

// 🔓 (isteğe bağlı) Logout işlemi — refresh token silinir
const logout = async (req, res) => {
  const { token } = req.body;
  if (token) await deleteRefreshToken(token);
  res.json({ message: "Çıkış başarılı" });
};

// 🌐 Export
module.exports = {
  register,
  login,
  refresh,
  logout
};
