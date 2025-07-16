exports.up = function(knex) {
  return knex.schema.createTable('rooms', function(table) {
    table.increments('id').primary();
    table.json('name').notNullable(); // Çok dilli oda adı (örn: { "tr": "Oda 101", "en": "Room 101" })
    table.string('cover').nullable();
    table.enu('status', ['available', 'maintenance', 'closed']).defaultTo('available');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rooms');
};
