/**
 * Örnek oda verileri ekler.
 */
exports.seed = async function(knex) {
  await knex('rooms').del();

  await knex('rooms').insert([
    { name: 'Oda 101', cover: '/images/oda101.jpg', status: 'available' },
    { name: 'Toplantı Salonu', cover: '/images/toplanti.jpg', status: 'maintenance' },
    { name: 'Konferans Odası', cover: '/images/konferans.jpg', status: 'closed' }
  ]);
};
