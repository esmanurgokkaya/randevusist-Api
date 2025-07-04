/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary(); // Otomatik artan ID
    table.string('username', 100).notNullable();
    table.string('email', 150).notNullable().unique(); // unique constraint
    table.string('password').notNullable();
    table.timestamps(true, true); // created_at ve updated_at otomatik
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
