/**
 * Kullanıcıların refresh token'larını saklayan tablo.
 * Alanlar: id, user_id (FK), token, expires_at, timestamps
 */
exports.up = function(knex) {
  return knex.schema.createTable('refresh_tokens', function(table) {
    table.increments('id').primary(); // Primary key
    table.integer('user_id').unsigned().notNullable()
         .references('id').inTable('users').onDelete('CASCADE'); // Foreign key to users
    table.string('token', 512).notNullable(); // Refresh token değeri (JWT token)
    table.timestamp('expires_at').notNullable(); // Token süresi dolma zamanı
    table.timestamps(true, true); // created_at ve updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('refresh_tokens');
};
