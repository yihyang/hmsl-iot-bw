exports.up = function(knex, Promise) {
  return knex.schema.table('oee_node_daily_inputs', function(t) {
    t.integer('am_capacity').nullable();
    t.integer('pm_capacity').nullable();
    t.integer('am_capacity_reason_id').nullable();
    t.integer('pm_capacity_reason_id').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('oee_node_daily_inputs', function(t) {
    t.dropColumn('am_capacity');
    t.dropColumn('pm_capacity');
    t.dropColumn('am_capacity_reason_id');
    t.dropColumn('pm_capacity_reason_id');
  });
};
