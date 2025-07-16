const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const z = require("zod");
const logger = require("../utils/logger");

const {
  createUser,
  findUserByEmail
} = require("../models/userModels");
const {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken
} = require("../models/tokenModel");
const { success } = require("zod/v4");

//  Zod register şeması
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
  role_id: z.number().int().optional().default(3)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await saveRefreshToken(user.id, token, expiresAt);
  return token;
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastname
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John
 *                 description: First name, minimum 2 characters
 *               lastname:
 *                 type: string
 *                 example: Doe
 *                 description: Last name, minimum 2 characters
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "05551234567"
 *                 description: Phone number, minimum 10 characters
 *               password:
 *                 type: string
 *                 example: "StrongP@ss1"
 *                 description: Password with at least one uppercase, lowercase, digit and special char (!@#$%^&*)
 *               role_id:
 *                 type: integer
 *                 example: 3
 *                 description: Optional user role id, default 3
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User successfully created.
 *                 userID:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */


const register = async (req, res) => {
console.log("Gelen İstek:", req.headers);
console.log(" İstek Body:", req.body);

  try {
    const {
      name,
      lastname,
      email,
      phone,
      password,
      role_id 
    } = registerSchema.parse(req.body);
    console.log("Gelen body:", req.body);

    const hashedPassword = await argon2.hash(password);
    const result = await createUser(name, lastname, email, phone, hashedPassword, role_id);

    logger.info(`New user registered: ${email} (ID: ${result.insertId})`);
    return res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      userID: result.insertId
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      logger.warn(`Registration attempt with existing email: ${req.body.email}`);
      return res.status(409).json({ message: "Bu e-posta zaten kayıtlı." });
    }
    if (err.errors) {
      logger.warn(`Validation errors during registration: ${JSON.stringify(err.errors)}`);
      return res.status(400).json({ message: "Geçersiz veri.", errors: err.errors });
    }
    logger.error(`Registration error: ${err.message}`);
    return res.status(500).json({ message: "Kayıt hatası", error: err.message });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: "StrongP@ss1"
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 42
 *                     name:
 *                       type: string
 *                       example: John
 *                     lastname:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     phone:
 *                       type: string
 *                       example: "05551234567"
 *                     role_id:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */

const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await findUserByEmail(email);

    if (!user || !(await argon2.verify(user.password, password))) {
      logger.warn(`Failed login attempt: ${email}`);
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }
    const accessToken = generateAccessToken(user);

    const refreshToken = await generateRefreshToken(user);

    logger.info(`Successful login: ${email}`);
    return res.json({
      success:true,
      message: "Giriş başarılı",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id
      }
      
    });
    
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({ message: "Giriş hatası", error: error.message });
  }
};

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using a valid refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token issued at login
 *     responses:
 *       200:
 *         description: New access and refresh tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Token not provided
 *       403:
 *         description: Invalid or expired token
 */


const refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    logger.warn("Refresh token not provided");
    return res.status(400).json({ message: "Token sağlanmadı" });
  }
  try {
    const stored = await findRefreshToken(token);
    if (!stored) {
      logger.warn("Invalid or deleted refresh token used");
      return res.status(403).json({ message: "Geçersiz veya silinmiş refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = { id: decoded.id, email: decoded.email };

    await deleteRefreshToken(token);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);
    logger.info(`Refresh token renewed for user: ${user.email}`);


    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    logger.error(`Refresh token verification error: ${err.message}`);
    return res.status(403).json({ message: "Token doğrulanamadı", error: err.message });
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate refresh token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token to invalidate
 *     responses:
 *       200:
 *         description: Logout successful
 */

const logout = async (req, res) => {
  const { token } = req.body;
  if (token) {
    await deleteRefreshToken(token);
   logger.info("Refresh token deleted, user logged out.");
  }
  else {
    logger.warn("Logout requested but no token provided.");
  }
   res.json({ message: "Çıkış başarılı" });
};

module.exports = {
  register,
  login,
  refresh,
  logout
};
