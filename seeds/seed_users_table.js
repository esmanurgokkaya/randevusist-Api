const argon2 = require('argon2');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('users').del();

  const hashedPassword = await argon2.hash('123456');

  await knex('users').insert([
    {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword
    },
    {
      username: 'esra',
      email: 'esra@example.com',
      password: hashedPassword
    }
  ]);
};
