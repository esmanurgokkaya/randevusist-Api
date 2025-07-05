/**
 * Oda rezervasyonlarını tutan tablo.
 * Alanlar: id, room_id, users (JSON array), start_datetime, end_datetime, timestamps
 */
exports.up = function(knex) {
  return knex.schema.createTable('availability_calendar', function(table) {
    table.increments('id').primary(); // Rezervasyon ID
    table.integer('room_id').unsigned().notNullable()
         .references('id').inTable('rooms').onDelete('CASCADE'); // Oda ilişkisi
    table.json('users').defaultTo(JSON.stringify([])); // Kullanıcı ID'lerini tutan json array
    table.datetime('start_datetime').notNullable(); // Başlangıç zamanı
    table.datetime('end_datetime').notNullable(); // Bitiş zamanı
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('availability_calendar');
};
