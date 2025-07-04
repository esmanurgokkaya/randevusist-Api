/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('availability_calendar', function (table) {
    table.increments('id').primary();
    table.integer('room_id').unsigned().notNullable()
         .references('id').inTable('rooms')
         .onDelete('CASCADE');
    table.json('users'); // tek user için string/int de yapabilirsin
    table.dateTime('start_datetime').notNullable();
    table.dateTime('end_datetime').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('availability_calendar');
};
