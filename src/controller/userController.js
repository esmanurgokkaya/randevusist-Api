// src/controller/userController.js
const { findUserById } = require('../models/userModels');

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


module.exports = {
    getUserProfile,
 
};