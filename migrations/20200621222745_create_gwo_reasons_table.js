exports.up = function(knex, Promise) {
  return knex.schema.createTable('gwo_reasons', function(t) {
    t.increments('id').unsigned().primary();
;
    t.string('name').notNullable();
    t.integer('position').notNullable().defaultTo(0);
    t.string('status').notNullable().defaultTo('active');
    t.integer('user_id').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gwo_reasons');
};
