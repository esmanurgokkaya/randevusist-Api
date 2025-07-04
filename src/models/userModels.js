const db = require('../config/db.js');

// Kullanıcı oluştur
const createUser = async (username, email, password) => {
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  const [result] = await db.query(query, [username, email, password]);
  return result;
};

// E-posta ile kullanıcıyı bul
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.query(query, [email]);
  return rows;
};

// ID ile kullanıcıyı bul
const findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await db.query(query, [id]);
  return rows;
};

// ID ile kullanıcıyı sil
const deleteUserById = async (id) => {
  const query = 'DELETE FROM users WHERE id = ?';
  const [result] = await db.query(query, [id]);
  return result;
};

// ID ile kullanıcı bilgilerini güncelle
const updateUserById = async (id, username, email, password) => {
  const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
  const [result] = await db.query(query, [username, email, password, id]);
  return result;
};

// Belirli bir e-posta başka bir kullanıcıya ait mi?
const isEmailTakenByAnotherUser = async (email, currentUserId) => {
  const query = 'SELECT * FROM users WHERE email = ? AND id != ?';
  const [rows] = await db.query(query, [email, currentUserId]);
  return rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  deleteUserById,
  updateUserById,
  isEmailTakenByAnotherUser
};
