const db = require('../config/db');

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
