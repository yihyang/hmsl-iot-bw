
exports.up = function(knex, Promise) {
  return knex.schema.createTable('oee_node_daily_input_capacity_reasons', function(t) {
    t.increments('id').unsigned().primary();

    t.string('status').nullable();
    t.string('title').nullable();

    t.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').nullable();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('oee_node_daily_input_capacity_reasons');
};
