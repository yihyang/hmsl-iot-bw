
exports.up = function(knex, Promise) {
  return knex.schema.table('oee_node_default_values', function(t) {
    t.integer('am_capacity').nullable();
    t.integer('pm_capacity').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('oee_node_default_values', function(t) {
    t.dropColumn('am_capacity');
    t.dropColumn('pm_capacity');
  });
};
