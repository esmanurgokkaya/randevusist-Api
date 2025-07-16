/**
 * Odalar tablosu için seed dosyası (JSON ile çoklu dil)
 */
exports.seed = async function(knex) {
  // Önce var olan tüm kayıtları temizle
  await knex('rooms').del();

  // Yeni verileri ekle
  await knex('rooms').insert([
    {
      name: JSON.stringify({ tr: 'Oda 101', en: 'Room 101'}),
      cover: '/images/oda101.jpg',
      status: 'available'
    },
    {
      name: JSON.stringify({ tr: 'Toplantı Salonu', en: 'Meeting Hall' }),
      cover: '/images/toplanti.jpg',
      status: 'maintenance'
    },
    {
      name: JSON.stringify({ tr: 'Konferans Odası', en: 'Conference Room' }),
      cover: '/images/konferans.jpg',
      status: 'closed'
    }
  ]);
};
