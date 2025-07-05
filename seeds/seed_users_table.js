const argon2 = require('argon2');

/**
 * Başlangıç kullanıcı verilerini ekler.
 * Şifreler güvenli şekilde hashlenir.
 */
exports.seed = async function(knex) {
  await knex('users').del(); // Önceki kayıtları temizle

  const password = await argon2.hash('123456'); // Ortak demo şifre

  await knex('users').insert([
    {
      name: 'Admin',
      lastname: 'User',
      email: 'admin@example.com',
      password,
      phone: '555-111-2222',
      role: 'admin'
    },
    {
      name: 'Esra',
      lastname: 'Yılmaz',
      email: 'esra@example.com',
      password,
      phone: '555-333-4444',
      role: 'employee'
    }
  ]);
};
