exports.seed = async function(knex) {
  await knex('permissions').del();
  await knex('permissions').insert([
    { id: 1, name: 'create_room' },
    { id: 2, name: 'update_room' },
    { id: 3, name: 'delete_room' },
    { id: 4, name: 'manage_users' }
  ]);
};
