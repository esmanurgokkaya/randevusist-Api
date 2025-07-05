/**
 * Odalar tablosunu oluşturur.
 * Alanlar: id, name, cover, status, timestamps
 */
exports.up = function(knex) {
  return knex.schema.createTable('rooms', function(table) {
    table.increments('id').primary(); // Oda ID
    table.string('name').notNullable(); // Oda adı
    table.string('cover').nullable(); // Görsel yolu
    table.enu('status', ['available', 'maintenance', 'closed']).defaultTo('available'); // Oda durumu
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rooms');
};