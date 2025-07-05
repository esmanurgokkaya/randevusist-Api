// 📦 Gerekli bağımlılıkları alıyoruz
const {
  createReservation,
  checkConflict,
  getReservationsByUser,
  getReservationById: getResById,
  updateReservationById,
  deleteReservationById,
  searchReservations
} = require("../models/reservationModel");

const { findUserById } = require("../models/userModels");
const sendMail = require("../utils/mailService");
const z = require("zod");

// 🧪 Yeni rezervasyon için veri doğrulama şeması
const reservationSchema = z.object({
  room_id: z.number().int(),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
});

/**
 * @desc Rezervasyon oluşturur
 * @route POST /create-reservation
 * @access Protected
 */
const createReservationController = async (req, res) => {
  try {
    const validation = reservationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Geçersiz veri",
        errors: validation.error.errors,
      });
    }

    const { room_id, start_datetime, end_datetime } = validation.data;
    const user_id = req.auth?.id;

    const conflict = await checkConflict(room_id, start_datetime, end_datetime);
    if (conflict.length > 0) {
      return res.status(409).json({ message: "Bu saat aralığı dolu.", conflict });
    }

    await createReservation(room_id, user_id, start_datetime, end_datetime);

    const [user] = await findUserById(user_id);
    if (user?.email) {
      const html = `
        <h3>Merhaba ${user.username},</h3>
        <p>Rezervasyonunuz başarıyla oluşturuldu.</p>
        <p><strong>Başlangıç:</strong> ${start_datetime}</p>
        <p><strong>Bitiş:</strong> ${end_datetime}</p>
      `;
      await sendMail(user.email, "Rezervasyon Onayı", html);
    }

    return res.status(201).json({ message: "Rezervasyon başarıyla oluşturuldu" });
  } catch (err) {
    console.error("Rezervasyon oluşturma hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

/**
 * @desc Giriş yapan kullanıcının rezervasyonlarını getirir
 * @route GET /my-reservations
 * @access Protected
 */
const getMyReservationsController = async (req, res) => {
  try {
    const user_id = req.auth?.id;
    const results = await getReservationsByUser(user_id);
    res.json({ reservations: results });
  } catch (err) {
    console.error("Rezervasyonları getirirken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

/**
 * @desc Belirli rezervasyon bilgilerini getirir
 * @route GET /reservation/:id
 * @access Protected
 */
const getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const results = await getResById(reservationId);
    if (!results.length) return res.status(404).json({ message: "Rezervasyon bulunamadı" });

    const reservation = results[0];
    const userIds = JSON.parse(reservation.users || "[]");
    if (!userIds.includes(req.auth?.id)) {
      return res.status(403).json({ message: "Bu rezervasyona erişim izniniz yok." });
    }

    res.json({ reservation });
  } catch (err) {
    console.error("Rezervasyon detay hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

/**
 * @desc Rezervasyonu günceller
 * @route PUT /update-reservation/:id
 * @access Protected
 */
const updateReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const { start_datetime, end_datetime } = req.body;
    const results = await getResById(reservationId);

    if (!results.length) return res.status(404).json({ message: "Rezervasyon bulunamadı" });

    const reservation = results[0];
    const userIds = JSON.parse(reservation.users || "[]");
    if (!userIds.includes(req.auth?.id)) {
      return res.status(403).json({ message: "Bu rezervasyonu güncelleyemezsiniz." });
    }

    const conflict = await checkConflict(reservation.room_id, start_datetime, end_datetime);
    if (conflict.some(r => r.id !== reservation.id)) {
      return res.status(409).json({ message: "Bu saat aralığı dolu." });
    }

    await updateReservationById(reservationId, start_datetime, end_datetime);

    const [user] = await findUserById(req.auth.id);
    if (user?.email) {
      const html = `
        <h3>Merhaba ${user.username},</h3>
        <p>Rezervasyonunuz başarıyla güncellendi.</p>
        <p><strong>Yeni Başlangıç:</strong> ${start_datetime}</p>
        <p><strong>Yeni Bitiş:</strong> ${end_datetime}</p>
      `;
      await sendMail(user.email, "Rezervasyon Güncelleme", html);
    }

    res.json({ message: "Rezervasyon güncellendi" });
  } catch (err) {
    console.error("Rezervasyon güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

/**
 * @desc Rezervasyonu siler ve kullanıcıya e-posta gönderir
 * @route DELETE /delete-reservation/:id
 * @access Protected
 */
const deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const results = await getResById(reservationId);
    if (!results.length) return res.status(404).json({ message: "Rezervasyon bulunamadı" });

    const reservation = results[0];
    const userIds = JSON.parse(reservation.users || "[]");
    if (!userIds.includes(req.auth?.id)) {
      return res.status(403).json({ message: "Bu rezervasyonu silemezsiniz." });
    }

    const [user] = await findUserById(req.auth.id);
    if (user?.email) {
      const html = `
        <h3>Merhaba ${user.username},</h3>
        <p>Rezervasyonunuz iptal edildi.</p>
        <p><strong>Başlangıç:</strong> ${reservation.start_datetime}</p>
      `;
      await sendMail(user.email, "Rezervasyon İptali", html);
    }

    await deleteReservationById(reservationId);
    res.json({ message: "Rezervasyon silindi" });
  } catch (err) {
    console.error("Rezervasyon silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

/**
 * @desc Filtrelenmiş rezervasyonları getirir (pagination destekli)
 * @route GET /search-reservations?page=&limit=&room_id=&start_date=&end_date=
 * @access Protected
 */
const searchReservationsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      room_id: req.query.room_id ? Number(req.query.room_id) : undefined,
      user_id: req.auth?.id,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const results = await searchReservations(filters, limit, offset);
    res.json({ page, limit, results });
  } catch (err) {
    console.error("Filtreleme hatası:", err);
    res.status(500).json({ message: 'Filtreleme sırasında hata oluştu' });
  }
};

// 🌐 Controller fonksiyonları dışa aktarılır
module.exports = {
  createReservation: createReservationController,
  getMyReservations: getMyReservationsController,
  getReservationById,
  updateReservation,
  deleteReservation,
  searchReservationsController,
};
