
exports.up = function(knex, Promise) {
  return knex.schema.createTable('node_group_oee', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('node_group_id').unsigned().references('id').inTable('node_groups').onDelete('cascade').notNullable();

    t.datetime('start_time').nullable();
    t.datetime('end_time').nullable();

    t.double('value').notNullable().defaultTo(0);
    t.double('availability_value').notNullable().defaultTo(0);
    t.double('performance_value').notNullable().defaultTo(0);
    t.double('quality_value').notNullable().defaultTo(0);

    t.timestamps();
    t.dateTime('deleted_at').nullable();

    t.index(['node_group_id', 'start_time', 'end_time']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('node_group_oee');
};
