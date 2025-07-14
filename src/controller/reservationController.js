// docker
// redis
// role base api  + rate limit 
// websocket 
// mikro servis mimarisi araştır
// repo design 
// entegre et 



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
const logger = require("../utils/logger");


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
/**
 * @swagger
 * /reservations/reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - start_datetime
 *               - end_datetime
 *             properties:
 *               room_id:
 *                 type: integer
 *                 example: 1
 *               start_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-10T09:00"
 *               end_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-10T11:00"
 *     responses:
 *       201:
 *         description: Reservation successfully created
 *       400:
 *         description: Invalid data or duration constraints
 *       409:
 *         description: Time slot is already taken
 *       500:
 *         description: Server error
 */
// olmayan odaya eklerken düzgün hata dönmüyor
const createReservationController = async (req, res) => {
  try {
    const validation = reservationSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn(`Invalid reservation data: ${JSON.stringify(validation.error.errors)}`);
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
      logger.warn(`Reservation duration too short by user ${user_id}`);
      return res.status(400).json({ message: "Rezervasyon süresi en az 1 saat olmalıdır." });
    }
    if (durationInHours > 2) {
      logger.warn(`Reservation duration too long by user ${user_id}`);
      return res.status(400).json({ message: "Rezervasyon süresi en fazla 2 saat olabilir." });
    }

    const start = toMySQLDatetime(start_datetime);
    const end = toMySQLDatetime(end_datetime);

    const conflict = await checkConflict(room_id, start, end);
    if (conflict.length > 0) {
      logger.info(`Reservation conflict detected for user ${user_id} in room ${room_id} between ${start} and ${end}`);
      return res.status(409).json({ message: "Bu saat aralığı dolu.", conflict });
    }

    await createReservation(room_id, user_id, start, end);
    logger.info(`Reservation created by user ${user_id} for room ${room_id} from ${start} to ${end}`);
    // Yeni rezervasyon başarıyla oluşturulduktan hemen sonra:
    const wsMessage = {
      type: 'reservation_taken',
      data: {
        room_id,
        start_datetime,
        end_datetime
      }
    };

    if (req.wss) {
      req.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(wsMessage));
        }
      });
    }


    const user = await findUserById(user_id);
    // if (user?.email) {
    //   const content = `
    //     <p>Rezervasyonunuz başarıyla oluşturuldu.</p>
    //     <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
    //       <tr>
    //         <td style="padding: 8px; background-color: #ecf0f1; font-weight: bold;">Başlangıç:</td>
    //         <td style="padding: 8px;">${formatDateTime(start_datetime)}</td>
    //       </tr>
    //       <tr>
    //         <td style="padding: 8px; background-color: #ecf0f1; font-weight: bold;">Bitiş:</td>
    //         <td style="padding: 8px;">${formatDateTime(end_datetime)}</td>
    //       </tr>
    //     </table>
    //   `;
    //   const html = renderEmailTemplate({
    //     title: "Rezervasyon Onayı",
    //     name: user.name,
    //     content,
    //   });
    //   await sendMail(user.email, "Rezervasyon Onayı", html);
    // }

    return res.status(201).json({ message: "Rezervasyon başarıyla oluşturuldu" });
  } catch (err) {
    logger.error(`Error creating reservation: ${err.message}`);
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
  
};
/**
 * @swagger
 * /reservations/reservations/me:
 *   get:
 *     summary: Get authenticated user's reservations (paginated)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of user's reservations
 *       500:
 *         description: Server error
 */

const getMyReservationsController = async (req, res) => {
  try {
    const user_id = req.auth?.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = { user_id };

    const results = await searchReservations(filters, limit, offset);
logger.info(`User ${user_id} fetched reservations page ${page} limit ${limit}`);
    res.json({ page, limit, results });
  } catch (err) {
    logger.error(`Error fetching reservations for user ${req.auth?.id}: ${err.message}`);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};


/**
 * @swagger
 * /reservations/reservations/{id}:
 *   get:
 *     summary: Get reservation details by ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation details
 *       403:
 *         description: Forbidden – not authorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */

const getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const results = await getResById(reservationId);
    if (!results.length) {
        logger.warn(`Reservation not found: ID ${reservationId}`);
        return res.status(404).json({ message: "Rezervasyon bulunamadı" });
      }
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
      logger.warn(`Unauthorized access attempt to reservation ${reservationId} by user ${req.auth?.id}`);
      return res.status(403).json({ message: "Bu rezervasyona erişim izniniz yok." });

    }
    logger.info(`Reservation ${reservationId} accessed by user ${req.auth?.id}`);
    res.json({ reservation });
  } catch (err) {
    logger.error(`Error fetching reservation details: ${err.message}`);   
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
/**
 * @swagger
 * /reservations/reservations/{id}:
 *   put:
 *     summary: Update a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_datetime
 *               - end_datetime
 *             properties:
 *               start_datetime:
 *                 type: string
 *                 format: date-time
 *               end_datetime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Reservation updated
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Not authorized to update this reservation
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Time slot conflict
 *       500:
 *         description: Server error
 */

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
       logger.warn(`Invalid update data for reservation ${reservationId}: ${JSON.stringify(validation.error.errors)}`);
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
      logger.warn(`Update failed: duration too short for reservation ${reservationId}`);
      return res.status(400).json({ message: "Rezervasyon süresi en az 1 saat olmalıdır." });
    }
    if (durationInHours > 2) {
      logger.warn(`Update failed: duration too long for reservation ${reservationId}`);
      return res.status(400).json({ message: "Rezervasyon süresi en fazla 2 saat olabilir." });
    }

    const results = await getResById(reservationId);
    if (!results.length) {
      logger.warn(`Reservation not found for update: ID ${reservationId}`);
      return res.status(404).json({ message: "Rezervasyon bulunamadı" });
    }

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
      logger.warn(`Unauthorized update attempt on reservation ${reservationId} by user ${req.auth?.id}`);
      return res.status(403).json({ message: "Bu rezervasyonu güncelleyemezsiniz." });
    }

    const start = toMySQLDatetime(start_datetime);
    const end = toMySQLDatetime(end_datetime);

    const conflict = await checkConflict(reservation.room_id, start, end);
    if (conflict.some((r) => r.id !== reservation.id)) {
      logger.info(`Time conflict detected during update of reservation ${reservationId}`);
      return res.status(409).json({ message: "Bu saat aralığı dolu." });
    }

    await updateReservationById(reservationId, start, end);
    logger.info(`Reservation ${reservationId} updated by user ${req.auth?.id}`);

    const user = await findUserById(req.auth.id);
    res.json({ message: "Rezervasyon güncellendi" });
  } catch (err) {
    logger.error(`Error updating reservation ${req.params.id}: ${err.message}`);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
/**
 * @swagger
 * /reservations/reservations/{id}:
 *   delete:
 *     summary: Delete a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */

const deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const results = await getResById(reservationId);
    if (!results.length) {
      logger.warn(`Reservation not found for deletion: ID ${reservationId}`);
      return res.status(404).json({ message: "Rezervasyon bulunamadı" });
    }
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
      logger.warn(`Unauthorized deletion attempt on reservation ${reservationId} by user ${req.auth?.id}`);
      return res.status(403).json({ message: "Bu rezervasyonu silemezsiniz." });
    }

    await deleteReservationById(reservationId);
    logger.info(`Reservation ${reservationId} deleted by user ${req.auth?.id}`);
    res.json({ message: "Rezervasyon silindi" });
  } catch (err) {
    logger.error(`Error deleting reservation ${req.params.id}: ${err.message}`);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
/**
 * @swagger
 * /reservations/reservations:
 *   get:
 *     summary: Search reservations with filters
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filtered reservation list
 *       500:
 *         description: Server error
 */

const searchReservationsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const filters = {
      room_id: req.query.room_id ? Number(req.query.room_id) : undefined,
      user_id: req.auth?.id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const results = await searchReservations(filters, limit, offset);
    logger.info(`User ${req.auth?.id} searched reservations with filters ${JSON.stringify(filters)} - page ${page}`);

    res.json({ page, limit, results });
  } catch (err) {
    console.error("Filtreleme hatası:", err);
    logger.error(`Error searching reservations: ${err.message}`);
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
