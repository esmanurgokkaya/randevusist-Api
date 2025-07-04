/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('rooms', function (table) {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('cover'); // görsel URL
    table.enum('status', ['available', 'maintenance', 'closed']).defaultTo('available');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('rooms');
};
