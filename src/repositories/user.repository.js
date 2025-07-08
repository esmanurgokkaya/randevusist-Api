const UserModel = require('../models/user.model'); // prisma.user

class UserRepository {
  /**
   * Yeni kullanıcı oluştur
   */
  async createUser({ name, lastname, email, phone, password, role = 'user' }) {
    return await UserModel.create({
      data: { name, lastname, email, phone, password, role }
    });
  }

  /**
   * E-posta ile kullanıcı getir
   */
  async findUserByEmail(email) {
    return await UserModel.findUnique({
      where: { email }
    });
  }

  /**
   * ID ile kullanıcı getir
   */
  async findUserById(id) {
    return await UserModel.findUnique({
      where: { id }
    });
  }

  /**
   * Kullanıcıyı ID ile sil
   */
  async deleteUserById(id) {
    return await UserModel.delete({
      where: { id }
    });
  }

  /**
   * Kullanıcı bilgilerini güncelle
   */
  async updateUserById(id, { name, lastname, email, phone, password }) {
    return await UserModel.update({
      where: { id },
      data: { name, lastname, email, phone, password }
    });
  }

  /**
   * Aynı e-posta başka bir kullanıcıda var mı?
   */
  async isEmailTakenByAnotherUser(email, currentUserId) {
    const user = await UserModel.findFirst({
      where: {
        email,
        NOT: { id: currentUserId }
      }
    });
    return !!user;
  }

  /**
   * Tüm kullanıcıları getir
   */
  async getAllUsers() {
    return await UserModel.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Arama + sayfalama + filtreleme (opsiyonel)
   */
  async searchUsers(filters = {}, page = 1, limit = 10) {
    const where = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      UserModel.count({ where })
    ]);

    return {
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}

module.exports = new UserRepository();
