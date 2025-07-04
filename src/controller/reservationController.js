// Veritabanı modelleri (SQL işlemleri bu dosyadan çağrılır)
const {
  createReservation,
  checkConflict,
  getReservationsByUser,
  getReservationById: getResById,
  updateReservationById,
  deleteReservationById
} = require('../models/reservationModel');

// Giriş (Auth) sonrası gelen body verilerini doğrulamak için Zod kullanıyoruz
const z = require('zod');

// 📌 Yeni rezervasyon verisi için doğrulama şeması
const reservationSchema = z.object({
  room_id: z.number().int(), // oda ID'si zorunlu ve integer olmalı
  start_datetime: z.string().datetime(), // başlangıç tarihi saat formatında olmalı
  end_datetime: z.string().datetime() // bitiş tarihi saat formatında olmalı
});

// 📍 [POST] /create-reservation
// Rezervasyon oluşturma işlemini gerçekleştirir
const createReservationController = (req, res) => {
  // 1. İstek verisi doğrulanır
  const validation = reservationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: 'Geçersiz veri',
      errors: validation.error.errors
    });
  }

  // 2. Doğrulanan veriler destructure edilir
  const { room_id, start_datetime, end_datetime } = validation.data;
  const user_id = req.auth?.id; // Token'dan kullanıcı ID'si alınır

  // 3. Rezervasyon zamanının çakışıp çakışmadığını kontrol et
  checkConflict(room_id, start_datetime, end_datetime, (err, results) => {
    if (err) return res.status(500).json({ message: 'Veritabanı hatası' });

    if (results.length > 0) {
      return res.status(409).json({ message: 'Bu saat aralığı dolu.' });
    }

    // 4. Çakışma yoksa rezervasyon veritabanına eklenir
    createReservation(room_id, user_id, start_datetime, end_datetime, (err) => {
      if (err) return res.status(500).json({ message: 'Rezervasyon eklenemedi' });

      return res.status(201).json({ message: 'Rezervasyon başarıyla oluşturuldu' });
    });
  });
};

// 📍 [GET] /my-reservations
// Giriş yapmış kullanıcının rezervasyonlarını getirir
const getMyReservationsController = (req, res) => {
  const user_id = req.auth?.id; // Token'dan kullanıcı ID'si alınır

  getReservationsByUser(user_id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Veritabanı hatası' });

    res.json({ reservations: results }); // JSON formatında tüm rezervasyonlar döner
  });
};

// 📍 [GET] /reservation/:id
// Belirli bir rezervasyonun detayını getirir
const getReservationById = (req, res) => {
  const reservationId = req.params.id; // URL'den rezervasyon ID'si alınır

  getResById(reservationId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Veritabanı hatası' });
    if (!results.length) return res.status(404).json({ message: 'Rezervasyon bulunamadı' });

    res.json({ reservation: results[0] }); // İlk ve tek sonucu döner
  });
};

// 📍 [PUT] /update-reservation/:id
// Belirli bir rezervasyonu günceller
const updateReservation = (req, res) => {
  const reservationId = req.params.id;
  const { start_datetime, end_datetime } = req.body;

  // Güncelleme işlemi yapılır
  updateReservationById(reservationId, start_datetime, end_datetime, (err) => {
    if (err) return res.status(500).json({ message: 'Güncelleme başarısız' });

    res.json({ message: 'Rezervasyon güncellendi' });
  });
};

// 📍 [DELETE] /delete-reservation/:id
// Belirli bir rezervasyonu siler
const deleteReservation = (req, res) => {
  const reservationId = req.params.id;

  // Silme işlemi yapılır
  deleteReservationById(reservationId, (err) => {
    if (err) return res.status(500).json({ message: 'Silme işlemi başarısız' });

    res.json({ message: 'Rezervasyon silindi' });
  });
};

// 🔄 Controller fonksiyonlarını dışa aktarıyoruz
module.exports = {
  createReservation: createReservationController,
  getMyReservations: getMyReservationsController,
  getReservationById,
  updateReservation,
  deleteReservation
};
