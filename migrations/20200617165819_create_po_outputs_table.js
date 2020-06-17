
exports.up = function(knex, Promise) {
  return knex.schema.createTable('po_outputs', function(t) {
    t.increments('id').unsigned().primary();
    t.integer('user_id').nullable();

    t.string('po_number').nullable();
    t.string('material_number').nullable();
    t.string('material_description').nullable();
    t.integer('target_quantity').nullable();
    t.string('unit').nullable();
    t.date('target_completion_date').nullable();

    t.index(['user_id'], 'index_user_id');

    t.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').nullable().defaultTo(null);
    t.dateTime('deleted_at').nullable().defaultTo(null);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('po_outputs');
};
