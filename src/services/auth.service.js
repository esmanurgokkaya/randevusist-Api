const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  async generateRefreshToken(user) {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün
    await tokenRepository.saveRefreshToken(user.id, token, expiresAt);
    return token;
  }

  async register(userData) {
    const exists = await userRepository.findUserByEmail(userData.email);
    if (exists) throw new Error('EMAIL_EXISTS');

    const hashedPassword = await argon2.hash(userData.password);
    const user = await userRepository.createUser({
      ...userData,
      password: hashedPassword
    });

    return user;
  }

  async login(email, password) {
    const user = await userRepository.findUserByEmail(email);
    if (!user || !(await argon2.verify(user.password, password))) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async refresh(oldToken) {
    const stored = await tokenRepository.findRefreshToken(oldToken);
    if (!stored) throw new Error('INVALID_REFRESH_TOKEN');

    const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
    await tokenRepository.deleteRefreshToken(oldToken);

    const newAccessToken = this.generateAccessToken(decoded);
    const newRefreshToken = await this.generateRefreshToken(decoded);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token) {
    await tokenRepository.deleteRefreshToken(token);
  }
}

module.exports = new AuthService();
