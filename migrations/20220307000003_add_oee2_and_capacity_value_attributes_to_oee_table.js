
exports.up = function(knex, Promise) {
  return knex.schema.table('oee', function(t) {
    t.double('oee2').nullable();
    t.double('capacity_value').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('oee', function(t) {
    t.dropColumn('oee2');
    t.dropColumn('capacity_value');
  });
};
