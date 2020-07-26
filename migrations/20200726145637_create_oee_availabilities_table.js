
exports.up = function(knex, Promise) {
  return knex.schema.createTable('oee_availabilities', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('node_id').unsigned().references('id').inTable('nodes').onDelete('cascade').notNullable();
    t.integer('oee_id').unsigned().references('id').inTable('oee').nullable();

    t.datetime('start_time').nullable();
    t.datetime('end_time').nullable();

    t.double('value').notNullable().defaultTo(0);
    t.json('value_breakdown').nullable();

    t.boolean('need_rework').notNullable().defaultTo(false);

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('oee_availabilities');
};
