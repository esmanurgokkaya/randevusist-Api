// src/models/userModels.js
const db = require('../config/db.js');

/**
 * Reusable query executor with automatic connection release.
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
 * @param {string} role - (varsayılan: 'user')
 */
const createUser = async (name, lastname, email, phone, password, role = 'user') => {
  const query = `
    INSERT INTO users (name, lastname, email, phone, password, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await _query(query, [name, lastname, email, phone, password, role]);
  return result;
};

/**
 * E-posta ile kullanıcıyı bulur
 */
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await _query(query, [email]);
  return rows[0] || null;
};

/**
 * ID ile kullanıcıyı bulur
 */
const findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await _query(query, [id]);
  return rows[0] || null;
};

/**
 * Kullanıcıyı ID ile siler
 */
const deleteUserById = async (id) => {
  const query = 'DELETE FROM users WHERE id = ?';
  const [result] = await _query(query, [id]);
  return result;
};

/**
 * Kullanıcı bilgilerini günceller
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
 */
const isEmailTakenByAnotherUser = async (email, currentUserId) => {
  const query = 'SELECT id FROM users WHERE email = ? AND id != ?';
  const [rows] = await _query(query, [email, currentUserId]);
  return rows.length > 0;
};

async function getUserPermissions(userId) {
  const [permissions] = await db.query(`
    SELECT p.name FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = ?
  `, [userId]);

  return permissions.map(p => p.name); // ['room:create', 'room:delete']
}

//  Export
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
