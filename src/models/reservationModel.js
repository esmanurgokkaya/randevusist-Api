const db = require('../config/db'); // mysql2/promise bağlantısı varsayılıyor

/**
 * Yeni bir rezervasyon oluşturur
 * @param {number} room_id - Rezervasyonun yapılacağı oda ID'si
 * @param {number} user_id - Rezervasyon yapan kullanıcının ID'si
 * @param {string} start_datetime - Başlangıç zamanı (ISO format)
 * @param {string} end_datetime - Bitiş zamanı (ISO format)
 */
async function createReservation(room_id, user_id, start_datetime, end_datetime) {
  const sql = `
    INSERT INTO availability_calendar (room_id, users, start_datetime, end_datetime)
    VALUES (?, ?, ?, ?)
  `;
  const usersJson = JSON.stringify([user_id]);
  await db.execute(sql, [room_id, usersJson, start_datetime, end_datetime]);
}

/**
 * Verilen oda ve zaman aralığı için çakışan rezervasyonları kontrol eder
 * @param {number} room_id - Oda ID'si
 * @param {string} start_datetime - Başlangıç zamanı
 * @param {string} end_datetime - Bitiş zamanı
 * @returns {Promise<Array>} - Çakışan rezervasyonlar listesi
 */
async function checkConflict(room_id, start_datetime, end_datetime) {
  const sql = `
    SELECT * FROM availability_calendar
    WHERE room_id = ?
      AND (
        (start_datetime < ? AND end_datetime > ?)
        OR
        (start_datetime >= ? AND end_datetime <= ?)
      )
  `;
  const [rows] = await db.execute(sql, [
    room_id,
    end_datetime, start_datetime,
    start_datetime, end_datetime
  ]);
  return rows;
}

/**
 * Belirli bir kullanıcıya ait tüm rezervasyonları getirir
 * @param {number} user_id - Kullanıcı ID'si
 * @returns {Promise<Array>} - Kullanıcının rezervasyonları
 */
async function getReservationsByUser(user_id) {
  const sql = `
    SELECT * FROM availability_calendar
    WHERE JSON_CONTAINS(users, ?, '$')
    ORDER BY start_datetime DESC
  `;
  const [rows] = await db.execute(sql, [JSON.stringify(user_id)]);
  return rows;
}

/**
 * Belirli bir rezervasyonu ID'ye göre getirir
 * @param {number} reservationId - Rezervasyon ID'si
 * @returns {Promise<Array>} - Rezervasyon bilgisi
 */
async function getReservationById(reservationId) {
  const sql = `SELECT * FROM availability_calendar WHERE id = ?`;
  const [rows] = await db.execute(sql, [reservationId]);
  return rows;
}

/**
 * Rezervasyonun başlangıç ve bitiş tarihini günceller
 * @param {number} reservationId - Güncellenecek rezervasyon ID'si
 * @param {string} start_datetime - Yeni başlangıç zamanı
 * @param {string} end_datetime - Yeni bitiş zamanı
 */
async function updateReservationById(reservationId, start_datetime, end_datetime) {
  const sql = `
    UPDATE availability_calendar
    SET start_datetime = ?, end_datetime = ?
    WHERE id = ?
  `;
  await db.execute(sql, [start_datetime, end_datetime, reservationId]);
}

/**
 * Belirli bir rezervasyonu ID'ye göre siler
 * @param {number} reservationId - Silinecek rezervasyon ID'si
 */
async function deleteReservationById(reservationId) {
  const sql = `DELETE FROM availability_calendar WHERE id = ?`;
  await db.execute(sql, [reservationId]);
}

/**
 * Filtreleme ve sayfalama ile rezervasyon araması yapar
 * @param {Object} filters - Filtreleme kriterleri (room_id, user_id, start_date, end_date)
 * @param {number} limit - Sayfalama limiti (varsayılan 5)
 * @param {number} offset - Sayfalama offset'i (varsayılan 0)
 * @returns {Promise<Array>} - Filtrelenmiş rezervasyon listesi
 */
async function searchReservations(filters, limit = 5, offset = 0) {
  let baseSql = `SELECT * FROM availability_calendar WHERE 1=1`;
  const params = [];

  if (filters.room_id) {
    baseSql += " AND room_id = ?";
    params.push(filters.room_id);
  }

  if (filters.user_id) {
    baseSql += " AND JSON_CONTAINS(users, ?, '$')";
    params.push(JSON.stringify(filters.user_id));
  }

  if (filters.start_date) {
    baseSql += " AND start_datetime >= ?";
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    baseSql += " AND end_datetime <= ?";
    params.push(filters.end_date);
  }

  baseSql += " ORDER BY start_datetime DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  console.log("SQL:", baseSql);
  console.log("Params:", params);

  const [rows] = await db.query(baseSql, params);
  return rows;
}

module.exports = {
  createReservation,
  checkConflict,
  getReservationsByUser,
  getReservationById,
  updateReservationById,
  deleteReservationById,
  searchReservations
};
