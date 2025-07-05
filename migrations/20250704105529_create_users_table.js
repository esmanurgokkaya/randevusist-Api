/**
 * Kullanıcılar tablosunu oluşturur.
 * Alanlar: id, name, lastname, email, password, phone, image, role, timestamps
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary(); // Otomatik artan kullanıcı ID
    table.string('name').notNullable(); // Ad
    table.string('lastname').notNullable(); // Soyad
    table.string('email').notNullable().unique(); // E-posta (tekil)
    table.string('password').notNullable(); // Şifre (argon2 ile hashlenecek)
    table.string('phone').nullable(); // Telefon numarası (opsiyonel)
    table.string('image').nullable(); // Profil resmi (opsiyonel)
    table.enu('role', ['admin', 'employee']).defaultTo('employee'); // Kullanıcı rolü
    table.timestamps(true, true); // created_at ve updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};