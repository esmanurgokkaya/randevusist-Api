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
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
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

    const { roomId, startDate, startTime, endTime } = parsed.data;
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
      startDate: new Date(startDate),
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
            <td style="padding: 8px;">${startDate}</td>
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
