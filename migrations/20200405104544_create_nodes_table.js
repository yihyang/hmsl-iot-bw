exports.up = function(knex, Promise) {
  return knex.schema.createTable('nodes', function(t) {
    t.increments('id').unsigned().primary();

    t.string('name').notNullable();
    t.string('ip_address').notNullable();
    t.string('mac_address').notNullable();
    t.string('current_status');

    t.integer('position_x').nullable().defaultTo(0);
    t.integer('position_y').nullable().defaultTo(0);

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('nodes');
};
