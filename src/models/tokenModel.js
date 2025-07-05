const db = require("../db");

/**
 * Yeni refresh token ekler
 */
async function saveRefreshToken(user_id, token, expires_at) {
  return db("refresh_tokens").insert({ user_id, token, expires_at });
}

/**
 * Refresh token doğrulaması
 */
async function findRefreshToken(token) {
  return db("refresh_tokens").where({ token }).first();
}

/**
 * Eski refresh token'ı siler
 */
async function deleteRefreshToken(token) {
  return db("refresh_tokens").where({ token }).del();
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
};
