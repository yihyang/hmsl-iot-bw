
exports.up = function(knex, Promise) {
  return knex.schema.table('po_jobs', function(t) {
    t.double('input_quantity').nullable().defaultTo(0);
    t.double('produced_quantity').nullable().defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('po_jobs', function(t) {
    t.dropColumn('produced_quantity');
    t.dropColumn('input_quantity');
  });
};
