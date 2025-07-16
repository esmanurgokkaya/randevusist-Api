exports.up = function(knex) {
  return knex.schema
    .createTable('rooms', function(table) {
      table.increments('id').primary();
      table.string('cover').nullable();
      table.enu('status', ['available', 'maintenance', 'closed']).defaultTo('available');
      table.timestamps(true, true);
    })
    .createTable('room_translations', function(table) {
      table.increments('id').primary();
      table.integer('room_id').unsigned().notNullable()
           .references('id').inTable('rooms').onDelete('CASCADE');
      table.string('locale', 5).notNullable();  // 'tr', 'en', vs
      table.string('name').notNullable();      // Oda adı çevrilmiş hali
      table.unique(['room_id', 'locale']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('room_translations')
    .dropTableIfExists('rooms');
};
