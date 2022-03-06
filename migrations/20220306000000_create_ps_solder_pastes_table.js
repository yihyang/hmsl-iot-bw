
exports.up = function(knex, Promise) {
  return knex.schema.createTable('ps_solder_pastes', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('creator_id')

    t.string('po_number').nullable()
    t.string('material_number').nullable()
    t.string('batch').nullable()
    t.string('bag_number').nullable()
    t.double('weight').defaultTo(0)

    t.timestamps();
    t.dateTime('deleted_at').nullable();

    t.index('creator_id');
    t.index('po_number');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ps_solder_pastes');
};
