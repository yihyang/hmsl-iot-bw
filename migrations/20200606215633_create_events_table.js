exports.up = function(knex, Promise) {
  return knex.schema.createTable('events', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('node_id').unsigned().references('id').inTable('nodes').onDelete('cascade');

    t.string('status').notNullable();
    t.string('raw_data').notNullable();
    t.datetime('start_time').nullable();
    t.datetime('end_time').nullable();
    t.float('duration').nullable();

    t.string('start_time_fetch_method').nullable();
    t.string('end_time_fetch_method').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable();

    t.index('node_id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events');
};
