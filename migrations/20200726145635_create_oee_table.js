
exports.up = function(knex, Promise) {
  return knex.schema.createTable('oee', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('node_id').unsigned().references('id').inTable('nodes').onDelete('cascade');

    t.datetime('start_time').nullable();
    t.datetime('end_time').nullable();

    t.double('value').notNullable().defaultTo(0);
    t.double('availability_value').notNullable().defaultTo(0);
    t.double('performance_value').notNullable().defaultTo(0);
    t.double('quality_value').notNullable().defaultTo(0);

    t.boolean('need_rework').notNullable().defaultTo(false);

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('oee');
};
