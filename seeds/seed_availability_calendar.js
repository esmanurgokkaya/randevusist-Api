/**
 * Örnek rezervasyon kayıtlarını ekler.
 */
exports.seed = async function(knex) {
  await knex('availability_calendar').del();

  await knex('availability_calendar').insert([
    {
      room_id: 1,
      users: JSON.stringify([1, 2]),
      start_datetime: '2025-07-06T14:00:00',
      end_datetime: '2025-07-06T16:00:00'
    },
    {
      room_id: 2,
      users: JSON.stringify([2]),
      start_datetime: '2025-07-07T10:00:00',
      end_datetime: '2025-07-07T12:00:00'
    }
  ]);
};
