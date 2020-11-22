exports.up = function(knex, Promise) {
  return knex.schema.createTable('node_groups', function(t) {
    t.increments('id').unsigned().primary();

    t.string('name').notNullable();
    t.integer('position').notNullable().defaultTo(0);

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('node_groups');
};
