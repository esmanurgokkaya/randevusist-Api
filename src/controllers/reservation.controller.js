// controllers/reservation.controller.js
const z = require("zod");
const reservationService = require("../services/reservation.service");
const { findUserById } = require("../repositories/user.repository");
const sendMail = require("../services/mail.service"); // Güncel hale geldi
const renderEmailTemplate = require("../utils/renderTemplate");

const LIBRARY_START = 9;
const LIBRARY_END = 16;

const reservationSchema = z.object({
  roomId: z.number(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Geçerli bir tarih girin.",
  }),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

function parseTime(str) {
  const [h, m] = str.split(":").map(Number);
  return h + m / 60;
}

function isWithinLibraryHours(start, end) {
  return start >= LIBRARY_START && end <= LIBRARY_END && end > start;
}

exports.createReservation = async (req, res) => {
  try {
    const parsed = reservationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Veri hatalı", errors: parsed.error.errors });
    }

    const { roomId, date, startTime, endTime } = parsed.data;
    const userId = req.auth?.id;

    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);

    if (!isWithinLibraryHours(startHour, endHour)) {
      return res.status(400).json({
        message: `Rezervasyon saatleri ${LIBRARY_START}:00 - ${LIBRARY_END}:00 aralığında ve en az 1 saat olmalıdır.`,
      });
    }

    await reservationService.createReservation({
      roomId,
      users: [userId],
      date: new Date(date),
      startTime,
      endTime,
    });

    const user = await findUserById(userId);
    if (user?.email) {
      const content = `
        <p>Rezervasyonunuz başarıyla oluşturuldu.</p>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; background-color: #ecf0f1; font-weight: bold;">Tarih:</td>
            <td style="padding: 8px;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background-color: #ecf0f1; font-weight: bold;">Saat:</td>
            <td style="padding: 8px;">${startTime} - ${endTime}</td>
          </tr>
        </table>
      `;

      const html = renderEmailTemplate({
        title: "Rezervasyon Onayı",
        name: user.name,
        content
      });

      await sendMail(user.email, "Rezervasyon Onayı", html);
    }

    res.status(201).json({ message: "Rezervasyon oluşturuldu." });
  } catch (err) {
    console.error("Rezervasyon oluşturma hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};
 
exports.getMyReservations = async (req, res) => {
  try {
    const userId = req.auth?.id;
    const reservations = await reservationService.getReservationsByUser(userId);
    res.json({ success: true, data: reservations });
  } catch (err) {
    console.error("Kullanıcı rezervasyonlarını getirme hatası:", err);
    res.status(500).json({ message: "Rezervasyonlar getirilemedi." });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await reservationService.getReservationById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Rezervasyon bulunamadı." });
    }
    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error("Rezervasyon detayı hatası:", err);
    res.status(500).json({ message: "Detay getirilemedi." });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await reservationService.updateReservation(id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Rezervasyon güncelleme hatası:", err);
    res.status(500).json({ message: "Güncelleme başarısız." });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await reservationService.deleteReservation(id);
    res.json({ success: true, message: "Rezervasyon silindi." });
  } catch (err) {
    console.error("Rezervasyon silme hatası:", err);
    res.status(500).json({ message: "Silme başarısız." });
  }
};

exports.searchReservations = async (req, res) => {
  try {
    const { date, roomId, page = 1, limit = 10 } = req.query;
    const filters = {};

    if (date) filters.date = date;
    if (roomId) filters.roomId = Number(roomId);

    const result = await reservationService.searchReservations(filters, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Rezervasyon arama hatası:", err);
    res.status(500).json({ message: "Arama başarısız." });
  }
};
