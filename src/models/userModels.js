const db = require('../config/db.js');

/**
 * Reusable query executor with automatic connection release.
 * @param {string} query - SQL sorgusu
 * @param {Array} params - Sorgu parametreleri
 * @returns {Promise<Array>} - Sorgu sonucu
 */
const _query = async (query, params) => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(query, params);
    return [rows];
  } finally {
    conn.release();
  }
};

/**
 * Yeni kullanıcı oluşturur
 * @param {string} name
 * @param {string} lastname
 * @param {string} email
 * @param {string} phone
 * @param {string} password - Argon2 hashlenmiş şifre
 * @param {int} role_id - (varsayılan: 'user')
 * @returns {Promise<Object>} - Ekleme sonucu
 */
const createUser = async (name, lastname, email, phone, password, role_id = 3) => {
  const query = `
    INSERT INTO users (name, lastname, email, phone, password, role_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await _query(query, [name, lastname, email, phone, password, role_id]);
  return result;
};

/**
 * E-posta ile kullanıcıyı bulur
 * @param {string} email
 * @returns {Promise<Object|null>} - Kullanıcı objesi ya da null
 */
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await _query(query, [email]);
  return rows[0] || null;
};

/**
 * ID ile kullanıcıyı bulur
 * @param {number} id
 * @returns {Promise<Object|null>} - Kullanıcı objesi ya da null
 */
const findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await _query(query, [id]);
  return rows[0] || null;
};

/**
 * Kullanıcıyı ID ile siler
 * @param {number} id
 * @returns {Promise<Object>} - Silme işleminin sonucu
 */
const deleteUserById = async (id) => {
  const query = 'DELETE FROM users WHERE id = ?';
  const [result] = await _query(query, [id]);
  return result;
};

/**
 * Kullanıcı bilgilerini günceller
 * @param {number} id
 * @param {string} name
 * @param {string} lastname
 * @param {string} email
 * @param {string} phone
 * @returns {Promise<Object>} - Güncelleme sonucu
 */
const updateUserById = async (id, name, lastname, email, phone) => {
  const query = `
    UPDATE users
    SET name = ?, lastname = ?, email = ?, phone = ?
    WHERE id = ?
  `;
  const [result] = await _query(query, [name, lastname, email, phone, id]);
  return result;
};

/**
 * Kullanıcının şifresini günceller
 * @param {number} id
 * @param {string} hashedPassword - Argon2 ile hashlenmiş şifre
 * @returns {Promise<Object>} - Güncelleme sonucu
 */
const updateUserPasswordById = async (id, hashedPassword) => {
  const query = `
    UPDATE users
    SET password = ?
    WHERE id = ?
  `;
  const [result] = await _query(query, [hashedPassword, id]);
  return result;
};

/**
 * Aynı e-posta başka kullanıcı tarafından kullanılıyor mu?
 * @param {string} email
 * @param {number} currentUserId - Kontrol edilecek kullanıcı ID'si
 * @returns {Promise<boolean>} - E-posta başka kullanıcıda varsa true
 */
const isEmailTakenByAnotherUser = async (email, currentUserId) => {
  const query = 'SELECT id FROM users WHERE email = ? AND id != ?';
  const [rows] = await _query(query, [email, currentUserId]);
  return rows.length > 0;
};

/**
 * Kullanıcının sahip olduğu izinlerin isimlerini döner
 * @param {number} userId
 * @returns {Promise<Array<string>>} - İzin isimleri dizisi
 */
async function getUserPermissions(userId) {
  const [permissions] = await db.query(`
    SELECT p.name FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = ?
  `, [userId]);

  return permissions.map(p => p.name);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  deleteUserById,
  updateUserById,
  isEmailTakenByAnotherUser,
  updateUserPasswordById,
  getUserPermissions
};
