const db = require('../config/db'); // mysql2/promise bağlantısı varsayılıyor

/**
 * @desc Yeni rezervasyon oluşturur
 * @param {number} room_id Oda ID'si
 * @param {number} user_id Kullanıcı ID'si (tek kullanıcı için)
 * @param {string} start_datetime Rezervasyon başlangıç zamanı (ISO format)
 * @param {string} end_datetime Rezervasyon bitiş zamanı (ISO format)
 */
async function createReservation(room_id, user_id, start_datetime, end_datetime) {
  const sql = `
    INSERT INTO availability_calendar (room_id, users, start_datetime, end_datetime)
    VALUES (?, ?, ?, ?)
  `;
  // users sütunu JSON array string olarak tutuluyor, başta sadece tek kullanıcı var
  const usersJson = JSON.stringify([user_id]);

  await db.execute(sql, [room_id, usersJson, start_datetime, end_datetime]);
}

/**
 * @desc Verilen oda ve tarih aralığında çakışan rezervasyonları kontrol eder
 * @param {number} room_id 
 * @param {string} start_datetime 
 * @param {string} end_datetime 
 * @returns {Promise<Array>} Çakışan rezervasyonlar listesi
 */
async function checkConflict(room_id, start_datetime, end_datetime) {
  const sql = `
    SELECT * FROM availability_calendar
    WHERE room_id = ?
      AND (
        (start_datetime < ? AND end_datetime > ?) -- yeni başlangıç aralıktaysa
        OR
        (start_datetime < ? AND end_datetime > ?) -- yeni bitiş aralıktaysa
        OR
        (start_datetime >= ? AND end_datetime <= ?) -- tamamen kapsanıyorsa
      )
  `;
  const [rows] = await db.execute(sql, [
    room_id,
    end_datetime, start_datetime,
    end_datetime, start_datetime,
    start_datetime, end_datetime
  ]);
  return rows;
}

/**
 * @desc Kullanıcının tüm rezervasyonlarını getirir
 * @param {number} user_id
 * @returns {Promise<Array>} Rezervasyon listesi
 */
async function getReservationsByUser(user_id) {
  // users alanı JSON array string, içinde user_id olanları getir
  const sql = `
    SELECT * FROM availability_calendar
    WHERE JSON_CONTAINS(users, ?)
    ORDER BY start_datetime DESC
  `;
  // JSON_CONTAINS için arama array olarak gönderilmeli
  const userJson = JSON.stringify([user_id]);
  const [rows] = await db.execute(sql, [userJson]);
  return rows;
}

/**
 * @desc Rezervasyon ID ile rezervasyon bilgisini getirir
 * @param {number} reservationId
 * @returns {Promise<Array>} Rezervasyon satırı (tek veya boş)
 */
async function getReservationById(reservationId) {
  const sql = `SELECT * FROM availability_calendar WHERE id = ?`;
  const [rows] = await db.execute(sql, [reservationId]);
  return rows;
}

/**
 * @desc Rezervasyonun başlangıç ve bitiş zamanlarını günceller
 * @param {number} reservationId
 * @param {string} start_datetime
 * @param {string} end_datetime
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
 * @desc Rezervasyonu ID ile siler
 * @param {number} reservationId
 */
async function deleteReservationById(reservationId) {
  const sql = `DELETE FROM availability_calendar WHERE id = ?`;
  await db.execute(sql, [reservationId]);
}

/**
 * @desc Filtre ve sayfalama ile rezervasyonları getirir
 * @param {object} filters Filtreler: {room_id, user_id, start_date, end_date}
 * @param {number} limit Sayfa başına kayıt sayısı
 * @param {number} offset Başlangıç kaydı
 * @returns {Promise<Array>} Filtrelenmiş rezervasyonlar
 */
async function searchReservations(filters, limit, offset) {
  let baseSql = `SELECT * FROM availability_calendar WHERE 1=1`;
  const params = [];

  if (filters.room_id) {
    baseSql += " AND room_id = ?";
    params.push(filters.room_id);
  }

  if (filters.user_id) {
    baseSql += " AND JSON_CONTAINS(users, ?)";
    params.push(JSON.stringify([filters.user_id]));  // Burada array olarak gönderiyoruz
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

  const [rows] = await db.execute(baseSql, params);
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
