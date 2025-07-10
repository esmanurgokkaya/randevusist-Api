exports.seed = async function(knex) {
  await knex('roles').del();
  await knex('roles').insert([
    { id: 1, name: 'admin' },
    { id: 2, name: 'employee' },
    { id: 3, name: 'user' }
  ]);
};