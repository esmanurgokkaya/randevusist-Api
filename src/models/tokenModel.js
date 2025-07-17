const db = require('../config/db');

/**
 * @desc Yeni bir refresh token'ı veritabanına kaydeder
 * @param {number} user_id - Token'a sahip kullanıcı ID'si
 * @param {string} token - Refresh token değeri
 * @param {Date} expires_at - Token'ın geçerlilik süresi
 * @returns {Promise<Object>} - Ekleme işleminin sonucu
 */
async function saveRefreshToken(user_id, token, expires_at) {
  const conn = await db.getConnection();
  try {
    const query = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
    const [result] = await conn.query(query, [user_id, token, expires_at]);
    return result;
  } finally {
    conn.release();
  }
}

/**
 * @desc Veritabanında belirtilen token'ı arar
 * @param {string} token - Aranacak refresh token
 * @returns {Promise<Object|null>} - Token bulunduysa obje, yoksa null
 */
async function findRefreshToken(token) {
  const conn = await db.getConnection();
  try {
    const query = 'SELECT * FROM refresh_tokens WHERE token = ?';
    const [rows] = await conn.query(query, [token]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

/**
 * @desc Belirtilen refresh token'ı veritabanından siler
 * @param {string} token - Silinecek token
 * @returns {Promise<Object>} - Silme işleminin sonucu
 */
async function deleteRefreshToken(token) {
  const conn = await db.getConnection();
  try {
    const query = 'DELETE FROM refresh_tokens WHERE token = ?';
    const [result] = await conn.query(query, [token]);
    return result;
  } finally {
    conn.release();
  }
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
};
