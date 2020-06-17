
exports.up = function(knex) {
  return knex.schema.createTable('oee_node_daily_inputs', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('node_id').unsigned().references('nodes.id');

    t.date('date').nullable();
    t.integer('am_availability').nullable();
    t.integer('pm_availability').nullable();

    t.unique(['node_id', 'date']);

    t.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').nullable().defaultTo(knex.raw('now()'));
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('oee_node_daily_inputs');
};
