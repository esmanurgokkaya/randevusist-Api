const TokenModel = require('../models/token.model'); // prisma.R

class TokenRepository {
  async saveRefreshToken(user_id, token, expiresAt) {
    return await TokenModel.create({
      data: {
        user_id,
        token,
        expiresAt
      }
    });
  }

  async findRefreshToken(token) {
    return await TokenModel.findUnique({
      where: { token }
    });
  }

  async deleteRefreshToken(token) {
    return await TokenModel.delete({
      where: { token }
    });
  }
}

module.exports = new TokenRepository();

