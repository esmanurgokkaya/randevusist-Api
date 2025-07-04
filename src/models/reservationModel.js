const db = require('../config/db.js');

// Yeni rezervasyon oluştur
const createReservation = async (room_id, user_id, start_datetime, end_datetime) => {
  const query = `
    INSERT INTO availability_calendar (room_id, users, start_datetime, end_datetime)
    VALUES (?, JSON_ARRAY(?), ?, ?)
  `;
  const [result] = await db.query(query, [room_id, user_id, start_datetime, end_datetime]);
  return result;
};

// Zaman çakışması olup olmadığını kontrol et
const checkConflict = async (room_id) => {
  const query = `
    SELECT id FROM availability_calendar 
    WHERE room_id = ?
    LIMIT 1
  `;

  console.log("⚡ [checkConflict] Basit ID kontrolü yapılıyor...");
  const [results] = await db.query(query, [room_id]);
  console.log("✅ [checkConflict] SQL sonuç döndü:", results);
  return results;
};

// Belirli kullanıcıya ait rezervasyonları getir
const getReservationsByUser = async (user_id) => {
  const query = `
    SELECT * FROM availability_calendar 
    WHERE JSON_CONTAINS(users, JSON_QUOTE(?))
    ORDER BY start_datetime DESC
  `;
  const [results] = await db.query(query, [user_id.toString()]);
  return results;
};

const getReservationById = async (user_id) => {
  const query = `
    SELECT * FROM availability_calendar 
    WHERE JSON_CONTAINS(users, CAST(? AS JSON))
    LIMIT 1
  `;
  const [results] = await db.query(query, [user_id]);
  return results;
};

// Rezervasyonu güncelle
const updateReservationById = async (id, start_datetime, end_datetime) => {
  const query = `
    UPDATE availability_calendar 
    SET start_datetime = ?, end_datetime = ? 
    WHERE id = ?
  `;
  const [result] = await db.query(query, [start_datetime, end_datetime, id]);
  return result;
};

// Rezervasyon sil
const deleteReservationById = async (id) => {
  const query = `DELETE FROM availability_calendar WHERE id = ?`;
  const [result] = await db.query(query, [id]);
  return result;
};

module.exports = {
  createReservation,
  checkConflict,
  getReservationsByUser,
  getReservationById,
  updateReservationById,
  deleteReservationById
};
