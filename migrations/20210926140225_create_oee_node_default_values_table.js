
exports.up = function(knex, Promise) {
  return knex.schema.createTable('oee_node_default_values', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('node_id').unsigned().references('nodes.id');

    t.integer('am_availability').nullable();
    t.integer('pm_availability').nullable();

    t.unique('node_id');

    t.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').nullable().defaultTo(knex.raw('now()'));
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('oee_node_default_values');
};
