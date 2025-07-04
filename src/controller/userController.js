// src/controller/userController.js
const { findUserById, deleteUserById, updateUserById } = require('../models/userModels');
const argon2 = require('argon2');
const z = require('zod'); // Zod kütüphanesini import ediyoruz


const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  oldPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});


// Profil bilgilerini getiren fonksiyon
const getUserProfile = (req, res) => {
    // req.auth içinde JWT'nin payload'ı bulunur (örneğin, { id: kullanici_id }).
    const userId = req.auth.id;

    findUserById(userId, (err, userDetails) => {
        if (err) {
            console.error("Profil bilgileri çekilirken veritabanı hatası:", err);
            return res.status(500).json({ message: 'Profil bilgileri çekilirken sunucu hatası.' });
        }
        if (!userDetails || userDetails.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        const userPublicData = {
            id: userDetails[0].id,
            username: userDetails[0].username,
            email: userDetails[0].email,
        };
        res.json({
            message: 'Kullanıcı profili verileri başarıyla alındı.',
            user: userPublicData
        });
    });
};



const deleteUserProfile =  async (req, res) => {
    const userID = req.auth.id;
  
  findUserById(userID, async (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }

    if (!results.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = results[0];

    try {

      deleteUserById(userID, (err) => {
        if (err) {
          console.error('Silme hatası:', err);
          return res.status(500).json({ message: 'Hesap silinemedi' });
        }

        return res.json({ message: 'Hesap başarıyla silindi' });
      });

    } catch (err) {
      console.error('Doğrulama hatası:', err);
      return res.status(500).json({ message: 'Şifre doğrulanırken hata oluştu' });
    }
  });
};



const updateUserProfile = async (req, res) => {
    const userID = req.auth.id;
    const updatedData = req.body;

    const validation = updateUserSchema.safeParse(updatedData);

    if(!validation.success){
        return res.status(400).json({ message : 'Geçersiz veri', errors : validation.error.errors})
    }

    findUserById(userId, async(err, result) => {
        if (err) return res.status(500).json({ message: 'Veritabanı hatası' });
        if (!results.length) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

        const user = results[0];
if (updateData.email && updateData.email !== user.email) {
      isEmailTakenByAnotherUser(updateData.email, userId, (err, emailCheckResults) => {
        if (err) return res.status(500).json({ message: 'Veritabanı hatası' });
        if (emailCheckResults.length > 0) {
          return res.status(409).json({ message: 'Bu e-posta başka kullanıcı tarafından kullanılıyor.' });
        }
        // Parola kontrolü ve güncelleme devam edecek
        processPasswordUpdate();
      });
    } else {
      processPasswordUpdate();
    }

    async function processPasswordUpdate() {
      try {
        let password_hash = user.password_hash;

        if (updateData.oldPassword || updateData.newPassword) {
          if (!updateData.oldPassword || !updateData.newPassword) {
            return res.status(400).json({ message: 'Parola değiştirmek için eski ve yeni parola gereklidir.' });
          }

          const match = await argon2.verify(password_hash, updateData.oldPassword);
          if (!match) {
            return res.status(401).json({ message: 'Eski parola yanlış.' });
          }

          password_hash = await argon2.hash(updateData.newPassword);
        }

        // Güncelle
        updateUserById(userId,
          updateData.username || user.username,
          updateData.email || user.email,
          password_hash,
          (err) => {
            if (err) {
              return res.status(500).json({ message: 'Kullanıcı güncellenirken hata oluştu.' });
            }
            return res.json({ message: 'Profil başarıyla güncellendi.' });
          }
        );

      } catch (error) {
        return res.status(500).json({ message: 'Parola işlemlerinde hata oluştu.' });
      }
    }
  });
  
};

module.exports = {
    getUserProfile,
    deleteUserProfile,
    updateUserProfile,
 
};