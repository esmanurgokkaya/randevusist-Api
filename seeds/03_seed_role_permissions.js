exports.seed = async function (knex) {
  await knex('role_permissions').del();

  // Role ve permission ID'lerini isimden çek
  const roles = await knex('roles');
  const permissions = await knex('permissions');

  const getRoleId = (name) => roles.find(r => r.name === name)?.id;
  const getPermissionId = (name) => permissions.find(p => p.name === name)?.id;

  await knex('role_permissions').insert([
    // Admin: tüm izinler
    { role_id: getRoleId('admin'), permission_id: getPermissionId('create_room') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('update_room') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('delete_room') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('manage_users') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('manage_permissions') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('create_reservation') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('update_reservation') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('delete_reservation') },
    { role_id: getRoleId('admin'), permission_id: getPermissionId('view_reservations') },

    // Employee: oda ve rezervasyon işlemleri
    { role_id: getRoleId('employee'), permission_id: getPermissionId('create_room') },
    { role_id: getRoleId('employee'), permission_id: getPermissionId('update_room') },
    { role_id: getRoleId('employee'), permission_id: getPermissionId('delete_room') },
    { role_id: getRoleId('employee'), permission_id: getPermissionId('create_reservation') },
    { role_id: getRoleId('employee'), permission_id: getPermissionId('update_reservation') },
    { role_id: getRoleId('employee'), permission_id: getPermissionId('delete_reservation') },
    { role_id: getRoleId('employee'), permission_id: getPermissionId('view_reservations') },

    // User: sadece kendi rezervasyonları
    { role_id: getRoleId('user'), permission_id: getPermissionId('create_reservation') },
    { role_id: getRoleId('user'), permission_id: getPermissionId('update_reservation') },
    { role_id: getRoleId('user'), permission_id: getPermissionId('delete_reservation') },
    { role_id: getRoleId('user'), permission_id: getPermissionId('view_reservations') }
  ]);
};
