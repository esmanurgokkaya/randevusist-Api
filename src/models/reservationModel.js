const db = require('../config/db'); // mysql2/promise bağlantısı varsayılıyor

/**
 * @desc Yeni rezervasyon oluşturur
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
 * @desc Verilen oda ve tarih aralığında çakışan rezervasyonları kontrol eder
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
    end_datetime, start_datetime, // örtüşme
    start_datetime, end_datetime  // içinde olma
  ]);
  return rows;
}

// eski kodu 
// async function checkConflict(room_id, start_datetime, end_datetime) {
//   const sql = 
//     SELECT * FROM availability_calendar
//     WHERE room_id = ?
//       AND (
//         (start_datetime < ? AND end_datetime > ?)
//         OR
//         (start_datetime < ? AND end_datetime > ?)
//         OR
//         (start_datetime >= ? AND end_datetime <= ?)
//       )
//   ;
//   const [rows] = await db.execute(sql, [
//     room_id,
//     end_datetime, start_datetime,
//     end_datetime, start_datetime,
//     start_datetime, end_datetime
//   ]);
//   return rows;
// }

/**
 * @desc Kullanıcının tüm rezervasyonlarını getirir
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
 * @desc Rezervasyon ID ile rezervasyon bilgisini getirir
 */
async function getReservationById(reservationId) {
  const sql = `SELECT * FROM availability_calendar WHERE id = ?`;
  const [rows] = await db.execute(sql, [reservationId]);
  return rows;
}

/**
 * @desc Rezervasyonun başlangıç ve bitiş zamanlarını günceller
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
 */
async function deleteReservationById(reservationId) {
  const sql = `DELETE FROM availability_calendar WHERE id = ?`;
  await db.execute(sql, [reservationId]);
}

/**
 * @desc Filtre ve sayfalama ile rezervasyonları getirir
 */
async function searchReservations(filters, limit = 10, offset = 0) {
  let baseSql = `SELECT * FROM availability_calendar WHERE 1=1`;
  const params = [];

  // Oda filtresi varsa
  if (filters.room_id) {
    baseSql += " AND room_id = ?";
    params.push(filters.room_id);
  }

  // Kullanıcı JSON içinde varsa
  if (filters.user_id) {
    baseSql += " AND JSON_CONTAINS(users, ?, '$')";
    params.push(JSON.stringify(filters.user_id));
  }

  // Tarih aralığı filtreleri
  if (filters.start_date) {
    baseSql += " AND start_datetime >= ?";
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    baseSql += " AND end_datetime <= ?";
    params.push(filters.end_date);
  }

  // Sıralama ve sayfalama
  baseSql += " ORDER BY start_datetime DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  // Debug için yazdır
  console.log("SQL:", baseSql);
  console.log("Params:", params);

  // Sorguyu çalıştır
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
