const db = require('../config/db.js');

// Yeni rezervasyon oluştur
const createReservation = (room_id, user_id, start_datetime, end_datetime, callback) => {
  const query = `
    INSERT INTO availability_calendar (room_id, users, start_datetime, end_datetime)
    VALUES (?, JSON_ARRAY(?), ?, ?)
  `;
  db.query(query, [room_id, user_id, start_datetime, end_datetime], callback);
};

// Zaman çakışması olup olmadığını kontrol et
const checkConflict = (room_id, start_datetime, end_datetime, callback) => {
  const query = `
    SELECT * FROM availability_calendar 
    WHERE room_id = ? 
      AND start_datetime < ? 
      AND end_datetime > ?
  `;
  db.query(query, [room_id, end_datetime, start_datetime], callback);
};

// Belirli kullanıcıya ait rezervasyonları getir
const getReservationsByUser = (user_id, callback) => {
  const query = `
    SELECT * FROM availability_calendar 
    WHERE JSON_CONTAINS(users, JSON_QUOTE(?))
    ORDER BY start_datetime DESC
  `;
  db.query(query, [user_id.toString()], callback);
};

// ID'ye göre rezervasyon getir
const getReservationById = (id, callback) => {
  const query = `SELECT * FROM availability_calendar WHERE id = ?`;
  db.query(query, [id], callback);
};

// Rezervasyonu güncelle
const updateReservationById = (id, start_datetime, end_datetime, callback) => {
  const query = `
    UPDATE availability_calendar 
    SET start_datetime = ?, end_datetime = ? 
    WHERE id = ?
  `;
  db.query(query, [start_datetime, end_datetime, id], callback);
};

// Rezervasyon sil
const deleteReservationById = (id, callback) => {
  const query = `DELETE FROM availability_calendar WHERE id = ?`;
  db.query(query, [id], callback);
};

module.exports = {
  createReservation,
  checkConflict,
  getReservationsByUser,
  getReservationById,
  updateReservationById,
  deleteReservationById
};
