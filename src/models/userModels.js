const db = require('../config/db.js'); // MySQL bağlantısını içe aktar

/**
 * Yeni kullanıcı oluşturur
 * @param {string} username - Kullanıcı adı
 * @param {string} email - Kullanıcının e-posta adresi
 * @param {string} password - Şifre (argon2 ile hashlenmiş olmalı)
 * @returns {Promise<object>} - MySQL işlem sonucu
 */
const createUser = async (username, email, password) => {
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  const [result] = await db.query(query, [username, email, password]);
  return result;
};

/**
 * E-posta ile kullanıcı arar
 * @param {string} email - Aranacak e-posta
 * @returns {Promise<object|null>} - Kullanıcı nesnesi veya null
 */
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.query(query, [email]);
  return rows[0] || null;
};

/**
 * ID ile kullanıcıyı bulur
 * @param {number} id - Kullanıcı ID'si
 * @returns {Promise<object|null>} - Kullanıcı nesnesi veya null
 */
const findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await db.query(query, [id]);
  return rows[0] || null;
};

/**
 * ID ile kullanıcıyı siler
 * @param {number} id - Kullanıcı ID'si
 * @returns {Promise<object>} - MySQL işlem sonucu
 */
const deleteUserById = async (id) => {
  const query = 'DELETE FROM users WHERE id = ?';
  const [result] = await db.query(query, [id]);
  return result;
};

/**
 * ID'ye göre kullanıcı bilgilerini günceller
 * @param {number} id - Kullanıcı ID'si
 * @param {string} username - Yeni kullanıcı adı
 * @param {string} email - Yeni e-posta
 * @param {string} password - Yeni şifre (argon2 hashlenmiş)
 * @returns {Promise<object>} - MySQL işlem sonucu
 */
const updateUserById = async (id, username, email, password) => {
  const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
  const [result] = await db.query(query, [username, email, password, id]);
  return result;
};

/**
 * Bu e-posta başka bir kullanıcıya mı ait? (email unique mi?)
 * @param {string} email - Kontrol edilecek e-posta
 * @param {number} currentUserId - Mevcut kullanıcının ID'si (dahil edilmeyecek)
 * @returns {Promise<boolean>} - E-posta başka kullanıcıda varsa true
 */
const isEmailTakenByAnotherUser = async (email, currentUserId) => {
  const query = 'SELECT id FROM users WHERE email = ? AND id != ?';
  const [rows] = await db.query(query, [email, currentUserId]);
  return rows.length > 0;
};

// Dışa aktarma
module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  deleteUserById,
  updateUserById,
  isEmailTakenByAnotherUser
};
