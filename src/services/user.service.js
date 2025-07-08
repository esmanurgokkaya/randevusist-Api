const userRepository = require('../repositories/user.repository');
const argon2 = require('argon2');

class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('NOT_FOUND');
    return user;
  }

  async deleteUserProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('NOT_FOUND');
    await userRepository.deleteUserById(userId);
    return true;
  }

  async updateUserProfile(userId, data) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('NOT_FOUND');

    let passwordToSave = user.password;

    // Parola değişikliği istenmiş mi?
    if (data.oldPassword || data.newPassword) {
      if (!data.oldPassword || !data.newPassword) {
        throw new Error('PASSWORD_BOTH_REQUIRED');
      }

      const match = await argon2.verify(user.password, data.oldPassword);
      if (!match) throw new Error('OLD_PASSWORD_INCORRECT');

      passwordToSave = await argon2.hash(data.newPassword);
    }

    // E-posta çakışması var mı?
    if (data.email && data.email !== user.email) {
      const exists = await userRepository.isEmailTakenByAnotherUser(data.email, userId);
      if (exists) throw new Error('EMAIL_ALREADY_USED');
    }

    await userRepository.updateUserById(userId, {
      name: data.name ?? user.name,
      lastname: data.lastname ?? user.lastname,
      email: data.email ?? user.email,
      phone: data.phone ?? user.phone,
      password: passwordToSave,
    });

    return true;
  }
}

module.exports = new UserService();
