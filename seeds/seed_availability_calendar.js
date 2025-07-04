/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // 1. Tablodaki verileri temizle
  await knex('availability_calendar').del();

  // 2. Örnek veri ekle
  await knex('availability_calendar').insert([
    {
      room_id: 4,
      users: JSON.stringify([7]),
      start_datetime: '2025-07-05 14:00:00',
      end_datetime: '2025-07-05 16:00:00'
    },
    {
      room_id: 5,
      users: JSON.stringify([8]),
      start_datetime: '2025-07-06 10:00:00',
      end_datetime: '2025-07-06 12:00:00'
    }
  ]);
};


// date time fms