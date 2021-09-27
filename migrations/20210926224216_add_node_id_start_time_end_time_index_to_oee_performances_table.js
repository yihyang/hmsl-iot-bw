
exports.up = function(knex, Promise) {
  return knex.schema.table('oee_performances', function(t) {
    t.index(['node_id', 'start_time', 'end_time']);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('oee_performances', function(t) {
    t.dropIndex(['node_id', 'start_time', 'end_time']);
  })
};
