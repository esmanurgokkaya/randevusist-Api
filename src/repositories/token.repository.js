// 🔐 Refresh token işlemleri için Prisma modeli
const TokenModel = require('../models/token.model'); // prisma.refreshToken

class TokenRepository {
  /**
   * 💾 Refresh token'ı veritabanına kaydeder
   * - Kullanıcı ID'si, token değeri ve bitiş tarihi saklanır
   */
  async saveRefreshToken(user_id, token, expiresAt) {
    return await TokenModel.create({
      data: {
        user_id,     // Hangi kullanıcıya ait olduğu
        token,       // Refresh token değeri
        expiresAt    // Token'ın geçerlilik süresi
      }
    });
  }

  /**
   * 🔍 Token verisiyle eşleşen refresh token'ı bulur
   * - Girişte refresh token kontrolü için kullanılır
   */
  async findRefreshToken(token) {
    return await TokenModel.findUnique({
      where: { token } // Token alanı unique olduğu için doğrudan eşleşir
    });
  }

  /**
   * ❌ Refresh token'ı siler (örneğin logout olduğunda)
   */
  async deleteRefreshToken(token) {
    return await TokenModel.delete({
      where: { token }
    });
  }
}

// Singleton export: tüm projede tek bir instance ile kullanılmak üzere dışa aktarılır
module.exports = new TokenRepository();
