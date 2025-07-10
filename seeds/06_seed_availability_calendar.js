/**
 * Örnek rezervasyon kayıtlarını dinamik olarak odalara ve kullanıcılara göre ekler.
 */
exports.seed = async function(knex) {
  await knex('availability_calendar').del();

  // Mevcut rooms ve users'ı çek
  const rooms = await knex('rooms').select('id').limit(2);
  const users = await knex('users').select('id').limit(2);

  if (rooms.length < 2 || users.length < 2) {
    throw new Error('Seed için yeterli oda veya kullanıcı yok.');
  }

  const [room1, room2] = rooms;
  const [user1, user2] = users;

  await knex('availability_calendar').insert([
    {
      room_id: room1.id,
      users: JSON.stringify([user1.id, user2.id]),
      start_datetime: '2025-07-06T14:00:00',
      end_datetime: '2025-07-06T16:00:00'
    },
    {
      room_id: room2.id,
      users: JSON.stringify([user1.id]),
      start_datetime: '2025-07-07T10:00:00',
      end_datetime: '2025-07-07T12:00:00'
    }
  ]);
};
