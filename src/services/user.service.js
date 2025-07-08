const userRepository = require('../repositories/user.repository');
const argon2 = require('argon2');

class UserService {
  /**
   * 📄 Kullanıcının profil bilgilerini getirir.
   * Kullanıcı ID'sine göre kullanıcıyı bulur. Yoksa hata fırlatır.
   */
  async getUserProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('NOT_FOUND'); // Kullanıcı bulunamadıysa hata
    return user; // Profil bilgileri döner
  }

  /**
   * ❌ Kullanıcı profilini siler.
   * Önce kullanıcıyı bulur, sonra siler. Eğer kullanıcı yoksa hata verir.
   */
  async deleteUserProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('NOT_FOUND');
    await userRepository.deleteUserById(userId);
    return true; // Başarıyla silindiği bilgisi
  }

  /**
   * ✏️ Kullanıcı profilini günceller.
   * - Mevcut bilgileri getirir.
   * - Parola değişikliği isteniyorsa doğrular.
   * - E-posta güncelleniyorsa çakışma kontrolü yapar.
   * - Son olarak verileri günceller.
   */
  async updateUserProfile(userId, data) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('NOT_FOUND');

    let passwordToSave = user.password; // Şifreyi başlangıçta mevcut haliyle tutar

    // 🔐 Parola değiştirilmek isteniyor mu?
    if (data.oldPassword || data.newPassword) {
      // Eğer biri girilmiş ama diğeri girilmemişse hata verir
      if (!data.oldPassword || !data.newPassword) {
        throw new Error('PASSWORD_BOTH_REQUIRED');
      }

      // Eski şifre doğru mu kontrol et
      const match = await argon2.verify(user.password, data.oldPassword);
      if (!match) throw new Error('OLD_PASSWORD_INCORRECT');

      // Yeni şifreyi hashle
      passwordToSave = await argon2.hash(data.newPassword);
    }

    // 📧 Yeni e-posta başka biri tarafından kullanılıyor mu?
    if (data.email && data.email !== user.email) {
      const exists = await userRepository.isEmailTakenByAnotherUser(data.email, userId);
      if (exists) throw new Error('EMAIL_ALREADY_USED');
    }

    // Veritabanına güncellenmiş bilgileri yaz
    await userRepository.updateUserById(userId, {
      name: data.name ?? user.name,
      lastname: data.lastname ?? user.lastname,
      email: data.email ?? user.email,
      phone: data.phone ?? user.phone,
      password: passwordToSave,
    });

    return true; // Güncelleme başarılı
  }
}

module.exports = new UserService();
