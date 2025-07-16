exports.seed = async function (knex) {
  await knex('permissions').del();
  await knex('permissions').insert([
    // Oda işlemleri
    { name: 'create_room' },
    { name: 'update_room' },
    { name: 'delete_room' },

    // Kullanıcı ve yetki
    { name: 'manage_users' },
    { name: 'manage_permissions' },

    // Rezervasyon işlemleri
    { name: 'create_reservation' },
    { name: 'update_reservation' },
    { name: 'delete_reservation' },
    { name: 'view_reservations' }
  ]);
};
