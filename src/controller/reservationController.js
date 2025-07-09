const {
  createReservation,
  checkConflict,
  getReservationsByUser,
  getReservationById: getResById,
  updateReservationById,
  deleteReservationById,
  searchReservations,
} = require("../models/reservationModel");

const { findUserById } = require("../models/userModels");
const sendMail = require("../utils/mailService");
const renderEmailTemplate = require("../utils/emailTemplate");
const z = require("zod");

// ISO 8601 string'i MySQL DATETIME formatına çevir
function toMySQLDatetime(isoString) {
  const date = new Date(isoString);
  if (isNaN(date)) throw new Error("Invalid date format");
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// ISO 8601 tarihini okunabilir hale getir
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
    timeZone: "Europe/Istanbul",
  });
}

const reservationSchema = z.object({
  room_id: z.number().int(),
  start_datetime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Geçerli bir başlangıç tarihi girin.",
  }),
  end_datetime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Geçerli bir bitiş tarihi girin.",
  }),
});

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

    // Süre kontrolü
    const startTime = new Date(start_datetime);
    const endTime = new Date(end_datetime);
    const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
    if (durationInHours < 1) {
      return res.status(400).json({ message: "Rezervasyon süresi en az 1 saat olmalıdır." });
    }
    if (durationInHours > 2) {
      return res.status(400).json({ message: "Rezervasyon süresi en fazla 2 saat olabilir." });
    }

    const start = toMySQLDatetime(start_datetime);
    const end = toMySQLDatetime(end_datetime);

    const conflict = await checkConflict(room_id, start, end);
    if (conflict.length > 0) {
      return res.status(409).json({ message: "Bu saat aralığı dolu.", conflict });
    }

    await createReservation(room_id, user_id, start, end);

    const user = await findUserById(user_id);
    if (user?.email) {
      const content = `
        <p>Rezervasyonunuz başarıyla oluşturuldu.</p>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; background-color: #ecf0f1; font-weight: bold;">Başlangıç:</td>
            <td style="padding: 8px;">${formatDateTime(start_datetime)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background-color: #ecf0f1; font-weight: bold;">Bitiş:</td>
            <td style="padding: 8px;">${formatDateTime(end_datetime)}</td>
          </tr>
        </table>
      `;
      const html = renderEmailTemplate({
        title: "Rezervasyon Onayı",
        name: user.name,
        content,
      });
      await sendMail(user.email, "Rezervasyon Onayı", html);
    }

    return res.status(201).json({ message: "Rezervasyon başarıyla oluşturuldu" });
  } catch (err) {
    console.error("Rezervasyon oluşturma hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

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

const getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const results = await getResById(reservationId);
    if (!results.length) return res.status(404).json({ message: "Rezervasyon bulunamadı" });

    const reservation = results[0];

    let userIds = [];
    try {
      userIds = Array.isArray(reservation.users)
        ? reservation.users
        : JSON.parse(reservation.users || "[]");
    } catch {
      userIds = [];
    }

    if (!userIds.includes(req.auth?.id)) {
      return res.status(403).json({ message: "Bu rezervasyona erişim izniniz yok." });
    }

    res.json({ reservation });
  } catch (err) {
    console.error("Rezervasyon detay hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const updateReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const schema = z.object({
      start_datetime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Geçerli bir başlangıç tarihi girin.",
      }),
      end_datetime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Geçerli bir bitiş tarihi girin.",
      }),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Geçersiz veri",
        errors: validation.error.errors,
      });
    }
    const { start_datetime, end_datetime } = validation.data;

    // Süre kontrolü
    const startTime = new Date(start_datetime);
    const endTime = new Date(end_datetime);
    const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
    if (durationInHours < 1) {
      return res.status(400).json({ message: "Rezervasyon süresi en az 1 saat olmalıdır." });
    }
    if (durationInHours > 2) {
      return res.status(400).json({ message: "Rezervasyon süresi en fazla 2 saat olabilir." });
    }

    const results = await getResById(reservationId);
    if (!results.length) return res.status(404).json({ message: "Rezervasyon bulunamadı" });

    const reservation = results[0];

    let userIds = [];
    try {
      userIds = Array.isArray(reservation.users)
        ? reservation.users
        : JSON.parse(reservation.users || "[]");
    } catch {
      userIds = [];
    }

    if (!userIds.includes(req.auth?.id)) {
      return res.status(403).json({ message: "Bu rezervasyonu güncelleyemezsiniz." });
    }

    const start = toMySQLDatetime(start_datetime);
    const end = toMySQLDatetime(end_datetime);

    const conflict = await checkConflict(reservation.room_id, start, end);
    if (conflict.some((r) => r.id !== reservation.id)) {
      return res.status(409).json({ message: "Bu saat aralığı dolu." });
    }

    await updateReservationById(reservationId, start, end);

    const user = await findUserById(req.auth.id);
    res.json({ message: "Rezervasyon güncellendi" });
  } catch (err) {
    console.error("Rezervasyon güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const results = await getResById(reservationId);
    if (!results.length) return res.status(404).json({ message: "Rezervasyon bulunamadı" });

    const reservation = results[0];

    let userIds = [];
    try {
      userIds = Array.isArray(reservation.users)
        ? reservation.users
        : JSON.parse(reservation.users || "[]");
    } catch {
      userIds = [];
    }

    if (!userIds.includes(req.auth?.id)) {
      return res.status(403).json({ message: "Bu rezervasyonu silemezsiniz." });
    }

    await deleteReservationById(reservationId);
    res.json({ message: "Rezervasyon silindi" });
  } catch (err) {
    console.error("Rezervasyon silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const searchReservationsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      room_id: req.query.room_id ? Number(req.query.room_id) : undefined,
      user_id: req.auth?.id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const results = await searchReservations(filters, limit, offset);
    res.json({ page, limit, results });
  } catch (err) {
    console.error("Filtreleme hatası:", err);
    res.status(500).json({ message: "Filtreleme sırasında hata oluştu" });
  }
};

module.exports = {
  createReservation: createReservationController,
  getMyReservations: getMyReservationsController,
  getReservationById,
  updateReservation,
  deleteReservation,
  searchReservationsController,
};
