
exports.up = function(knex, Promise) {
  return knex.schema.table('po_records', function(t) {
    t.double('input_quantity').nullable().defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('po_records', function(t) {
    t.dropColumn('input_quantity');
  });
};
