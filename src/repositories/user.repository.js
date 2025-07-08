const UserModel = require('../models/user.model'); // prisma.user

class UserRepository {
  /**
   * 👤 Yeni kullanıcı oluşturur
   * - Kayıt (register) işlemi sırasında çağrılır
   */
  async createUser({ name, lastname, email, phone, password, role = 'user' }) {
    return await UserModel.create({
      data: { name, lastname, email, phone, password, role }
    });
  }

  /**
   * 📧 E-posta adresiyle kullanıcıyı getir
   * - Giriş (login) sırasında kullanılır
   */
  async findUserByEmail(email) {
    return await UserModel.findUnique({
      where: { email }
    });
  }

  /**
   * 🔍 Kullanıcıyı ID ile getir
   * - Profil işlemleri ve rezervasyonlar için kullanılır
   */
  async findUserById(id) {
    return await UserModel.findUnique({
      where: { id }
    });
  }

  /**
   * ❌ Kullanıcıyı sil
   * - Profil silme işlemi
   */
  async deleteUserById(id) {
    return await UserModel.delete({
      where: { id }
    });
  }

  /**
   * ✏️ Kullanıcı bilgilerini güncelle
   * - Profil güncelleme formunda kullanılır
   */
  async updateUserById(id, { name, lastname, email, phone, password }) {
    return await UserModel.update({
      where: { id },
      data: { name, lastname, email, phone, password }
    });
  }

  /**
   * 📛 Bu e-posta başka bir kullanıcıya mı ait?
   * - Email benzersizliği kontrolü için kullanılır
   */
  async isEmailTakenByAnotherUser(email, currentUserId) {
    const user = await UserModel.findFirst({
      where: {
        email,
        NOT: { id: currentUserId }
      }
    });
    return !!user; // user varsa true döner
  }

  /**
   * 📋 Tüm kullanıcıları getir
   * - Admin panelinde kullanıcı listesi
   */
  async getAllUsers() {
    return await UserModel.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 🔍 Arama ve sayfalama (isteğe bağlı filtre)
   * - Admin panelinde kullanıcı filtreleme aracı
   */
  async searchUsers(filters = {}, page = 1, limit = 10) {
    const where = {};

    // İsim araması
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' }; // büyük/küçük harfe duyarsız
    }

    // E-posta araması
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

// Tüm sistemde tek bir instance olarak kullanılmak üzere dışa aktarılır
module.exports = new UserRepository();
