const jwt = require("jsonwebtoken");
require('dotenv').config();

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Önce tabloyu temizle
  await knex('refresh_tokens').del();

  // Kullanıcılar tablosundan örnek kullanıcıyı al (örneğin id: 1)
  const user = await knex('users').where({ email: 'admin@example.com' }).first();

  if (!user) {
    console.warn("⚠️ admin@example.com bulunamadı. Seed iptal edildi.");
    return;
  }

  // Refresh token üret
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Expire timestamp hesapla
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün sonrası

  // Insert işlemi
  await knex('refresh_tokens').insert([
    {
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt
    }
  ]);
};
