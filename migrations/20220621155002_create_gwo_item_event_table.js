exports.up = function(knex, Promise) {
  return knex.schema.createTable('gwo_item_event', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('gwo_item_id');
    t.integer('event_id');
    t.integer('gwo_reason_id');

    t.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').nullable();
    t.dateTime('deleted_at').nullable();

    t.index('gwo_item_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gwo_item_event');
};
