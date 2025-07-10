exports.up = async function(knex) {
  await knex.schema.alterTable('users', function(table) {
    table.index('role_id', 'idx_users_role_id');
  });

  await knex.schema.alterTable('role_permissions', function(table) {
    table.index('role_id', 'idx_role_permissions_role_id');
    table.index('permission_id', 'idx_role_permissions_permission_id');
  });

  await knex.schema.alterTable('permissions', function(table) {
    table.index('name', 'idx_permissions_name');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('users', function(table) {
    table.dropIndex('role_id', 'idx_users_role_id');
  });

  await knex.schema.alterTable('role_permissions', function(table) {
    table.dropIndex('role_id', 'idx_role_permissions_role_id');
    table.dropIndex('permission_id', 'idx_role_permissions_permission_id');
  });

  await knex.schema.alterTable('permissions', function(table) {
    table.dropIndex('name', 'idx_permissions_name');
  });
};
