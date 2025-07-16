exports.seed = async function(knex) {
  // Önce tabloları temizle
  await knex('room_translations').del();
  await knex('rooms').del();

  // Odaları ekle (status ve cover ile)
  const [room1Id] = await knex('rooms').insert({
    cover: '/images/oda101.jpg',
    status: 'available'
  }).returning('id');

  const [room2Id] = await knex('rooms').insert({
    cover: '/images/toplanti.jpg',
    status: 'maintenance'
  }).returning('id');

  const [room3Id] = await knex('rooms').insert({
    cover: '/images/konferans.jpg',
    status: 'closed'
  }).returning('id');

  // Çevirileri ekle
  await knex('room_translations').insert([
    // Oda 1
    { room_id: room1Id, locale: 'tr', name: 'Oda 101' },
    { room_id: room1Id, locale: 'en', name: 'Room 101' },

    // Oda 2
    { room_id: room2Id, locale: 'tr', name: 'Toplantı Salonu' },
    { room_id: room2Id, locale: 'en', name: 'Meeting Room' },

    // Oda 3
    { room_id: room3Id, locale: 'tr', name: 'Konferans Odası' },
    { room_id: room3Id, locale: 'en', name: 'Conference Room' },
  ]);
};
