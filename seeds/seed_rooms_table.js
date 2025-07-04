/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('rooms').del();

  await knex('rooms').insert([
    { name: 'Toplantı Odası 1', cover: 'room1.jpg', status: 'available' },
    { name: 'Okuma Salonu', cover: 'room2.jpg', status: 'maintenance' },
    { name: 'Bilgisayar Odası', cover: 'room3.jpg', status: 'closed' }
  ]);
};
