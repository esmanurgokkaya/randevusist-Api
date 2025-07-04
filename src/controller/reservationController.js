// Veritabanı modelleri (SQL işlemleri bu dosyadan çağrılır)
const {
  createReservation,
  checkConflict,
  getReservationsByUser,
  getReservationById: getResById,
  updateReservationById,
  deleteReservationById,
} = require("../models/reservationModel");

// Giriş (Auth) sonrası gelen body verilerini doğrulamak için Zod kullanıyoruz
const z = require("zod");

// 📌 Yeni rezervasyon verisi için doğrulama şeması
const reservationSchema = z.object({
  room_id: z.number().int(), // oda ID'si zorunlu ve integer olmalı
  start_datetime: z.string().datetime(), // başlangıç tarihi saat formatında olmalı
  end_datetime: z.string().datetime(), // bitiş tarihi saat formatında olmalı
});

const createReservationController = (req, res) => {
  console.log("🎯 [CREATE] createReservationController başlatıldı");

  // 1. BODY verisi Zod ile doğrulanıyor
  const validation = reservationSchema.safeParse(req.body);
  if (!validation.success) {
    console.warn("⚠️ [VALIDATION] Geçersiz veri:", validation.error.errors);
    return res.status(400).json({
      message: "Geçersiz veri",
      errors: validation.error.errors,
    });
  }

  // 2. Doğrulama başarılı → veriler ayrıştırılıyor
  const { room_id, start_datetime, end_datetime } = validation.data;
  const user_id = req.auth?.id;

  console.log("📥 [INPUT] room_id:", room_id);
  console.log("📥 [INPUT] start_datetime:", start_datetime);
  console.log("📥 [INPUT] end_datetime:", end_datetime);
  console.log("📥 [INPUT] user_id:", user_id);

  // 3. Zaman aşımı mekanizması kurulur (5 saniye)
  let timeoutTriggered = false;
  const timeout = setTimeout(() => {
    timeoutTriggered = true;
    console.error("⏰ [TIMEOUT] 5 saniyeyi geçti, işlem iptal edildi");
    return res.status(504).json({
      message: "İstek zaman aşımına uğradı (timeout)",
      debug: { room_id, start_datetime, end_datetime, user_id },
    });
  }, 5000);

  // 4. Oda bu saat aralığında dolu mu kontrol ediliyor
  console.log("🔄 [CHECK] checkConflict fonksiyonu çağrılıyor...");
  checkConflict(room_id, start_datetime, end_datetime, (err, results) => {
    console.log("✅ [CALLBACK] checkConflict callback çalıştı");

    if (timeoutTriggered) {
      console.warn(
        "⚠️ [AFTER TIMEOUT] checkConflict sonucu geç geldi, işlem atlandı"
      );
      return;
    }
    clearTimeout(timeout);
    console.log("🧹 [CLEAR] Timeout temizlendi");

    if (err) {
      console.error("❌ [DB ERROR] checkConflict hatası:", err);
      return res.status(500).json({ message: "Veritabanı hatası", error: err });
    }

    console.log("📊 [DB RESULT] checkConflict sonucu:", results);

    if (results.length > 0) {
      console.warn("🚫 [CONFLICT] Bu saat aralığı zaten dolu:", results);
      return res
        .status(409)
        .json({ message: "Bu saat aralığı dolu.", results });
    }

    // 5. Rezervasyon oluşturuluyor
    console.log("🟢 [INSERT] createReservation başlatılıyor...");
    createReservation(room_id, user_id, start_datetime, end_datetime, (err) => {
      console.log("✅ [CALLBACK] createReservation callback tetiklendi");

      if (timeoutTriggered) {
        console.warn(
          "⚠️ [AFTER TIMEOUT] createReservation sonucu geç geldi, response gönderilmeyecek"
        );
        return;
      }

      clearTimeout(timeout);
      console.log("🧹 [CLEAR] Timeout tekrar temizlendi");

      if (err) {
        console.error("❌ [DB ERROR] createReservation hatası:", err);
        return res
          .status(500)
          .json({ message: "Rezervasyon eklenemedi", error: err });
      }

      console.log("🎉 [SUCCESS] Rezervasyon başarıyla oluşturuldu");
      return res
        .status(201)
        .json({ message: "Rezervasyon başarıyla oluşturuldu" });
    });
  });
};

// 📍 [GET] /my-reservations
// Giriş yapmış kullanıcının rezervasyonlarını getirir
const getMyReservationsController = (req, res) => {
  const user_id = req.auth?.id; // Token'dan kullanıcı ID'si alınır
  console.log("👉 GELEN USER ID:", user_id); // 🚨 BURAYA LOG KOY

  getReservationsByUser(user_id, (err, results) => {
    if (err) return res.status(500).json({ message: "Veritabanı hatası" });

    res.json({ reservations: results }); // JSON formatında tüm rezervasyonlar döner
  });
};

// 📍 [GET] /reservation/:id
// Belirli bir rezervasyonun detayını getirir
const getReservationById = (req, res) => {
  const reservationId = req.params.id; // URL'den rezervasyon ID'si alınır

  getResById(reservationId, (err, results) => {
    if (err) return res.status(500).json({ message: "Veritabanı hatası" });
    if (!results.length)
      return res.status(404).json({ message: "Rezervasyon bulunamadı" });

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
    if (err) return res.status(500).json({ message: "Güncelleme başarısız" });

    res.json({ message: "Rezervasyon güncellendi" });
  });
};

// 📍 [DELETE] /delete-reservation/:id
// Belirli bir rezervasyonu siler
const deleteReservation = (req, res) => {
  const reservationId = req.params.id;

  // Silme işlemi yapılır
  deleteReservationById(reservationId, (err) => {
    if (err) return res.status(500).json({ message: "Silme işlemi başarısız" });

    res.json({ message: "Rezervasyon silindi" });
  });
};

// 🔄 Controller fonksiyonlarını dışa aktarıyoruz
module.exports = {
  createReservation: createReservationController,
  getMyReservations: getMyReservationsController,
  getReservationById,
  updateReservation,
  deleteReservation,
};
