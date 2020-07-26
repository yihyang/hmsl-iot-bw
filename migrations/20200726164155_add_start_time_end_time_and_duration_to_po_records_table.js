
exports.up = function(knex, Promise) {
  return knex.schema.table('po_records', function(t) {
    t.datetime('start_time').nullable().defaultTo(null);
    t.datetime('end_time').nullable().defaultTo(null);
    t.double('duration').nullable().defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('po_records', function(t) {
    t.dropColumn('start_time');
    t.dropColumn('end_time');
    t.dropColumn('duration');
  });
};
