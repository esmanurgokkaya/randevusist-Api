/**
 * Kullanıcılar tablosunu oluşturur.
 * Alanlar: id, name, lastname, email, password, phone, image, role, timestamps
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('lastname').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('phone').nullable();
    table.string('image').nullable();
    table.integer('role_id').unsigned().references('id').inTable('roles');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};