
exports.up = function(knex, Promise) {
  return knex.schema.table('nodes', function(t) {
    t.integer('node_group_id').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('nodes', function(t) {
    t.dropColumn('node_group_id');
  });
};
