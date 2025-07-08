const argon2 = require('argon2'); // 🔒 Güvenli şifreleme algoritması
const jwt = require('jsonwebtoken'); // 🔐 JWT oluşturmak ve doğrulamak için
const userRepository = require('../repositories/user.repository'); // 👤 Kullanıcı işlemleri
const tokenRepository = require('../repositories/token.repository'); // 🔄 Refresh token işlemleri

class AuthService {
  /**
   * 🔐 Erişim (access) token oluştur
   * - Süresi kısa (1 saat)
   * - Kullanıcı oturumunu temsil eder
   */
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },          // payload
      process.env.JWT_SECRET,                      // gizli anahtar (ENV üzerinden)
      { expiresIn: '1h' }                           // geçerlilik süresi
    );
  }

  /**
   * 🔁 Yenileme (refresh) token oluştur
   * - Daha uzun süre geçerli (7 gün)
   * - Veritabanında saklanır
   */
  async generateRefreshToken(user) {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün sonrasının tarihi
    await tokenRepository.saveRefreshToken(user.id, token, expiresAt); // DB'ye kaydet
    return token;
  }

  /**
   * 📝 Kayıt (register)
   * - Kullanıcının e-postası var mı kontrol edilir
   * - Şifre hash'lenir (argon2)
   * - Kullanıcı oluşturulur
   */
  async register(userData) {
    const exists = await userRepository.findUserByEmail(userData.email);
    if (exists) throw new Error('EMAIL_EXISTS');

    const hashedPassword = await argon2.hash(userData.password); // Şifreyi güvenli hale getir
    const user = await userRepository.createUser({
      ...userData,
      password: hashedPassword
    });

    return user; // frontend'e dönecek olan kullanıcı bilgisi (şifresiz)
  }

  /**
   * 🔑 Giriş (login)
   * - E-posta ve şifre doğrulanır
   * - Access ve Refresh token oluşturulur
   */
  async login(email, password) {
    const user = await userRepository.findUserByEmail(email);
    const isValid = user && await argon2.verify(user.password, password);

    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS'); // E-posta veya şifre yanlış
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { user, accessToken, refreshToken }; // oturum bilgileri
  }

  /**
   * 🔄 Refresh işlemi
   * - Refresh token doğrulanır
   * - Eski token veritabanından silinir
   * - Yeni token seti oluşturulur
   */
  async refresh(oldToken) {
    const stored = await tokenRepository.findRefreshToken(oldToken);
    if (!stored) throw new Error('INVALID_REFRESH_TOKEN');

    const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET); // Token çözülür
    await tokenRepository.deleteRefreshToken(oldToken); // Güvenlik için eski token silinir

    const newAccessToken = this.generateAccessToken(decoded);
    const newRefreshToken = await this.generateRefreshToken(decoded);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * 🚪 Oturumu kapat
   * - Refresh token silinir
   */
  async logout(token) {
    await tokenRepository.deleteRefreshToken(token);
  }
}

// 📤 Singleton instance export edilir
module.exports = new AuthService();
