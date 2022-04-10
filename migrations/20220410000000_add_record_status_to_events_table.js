
exports.up = function(knex, Promise) {
  return knex.schema.table('events', function(t) {
    t.string('record_status').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('events', function(t) {
    t.dropColumn('record_status');
  });
};
