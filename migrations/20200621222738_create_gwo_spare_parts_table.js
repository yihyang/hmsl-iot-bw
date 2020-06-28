
exports.up = function(knex, Promise) {
  return knex.schema.createTable('gwo_spare_parts', function(t) {
    t.increments('id').unsigned().primary();

    t.string('sp').nullable();
    t.string('spc').nullable();
    t.string('item').nullable();
    t.string('area').nullable();
    t.integer('minimum_quantity').defaultTo(0);
    t.integer('current_quantity').defaultTo(0);
    t.integer('position').notNullable().defaultTo(0);
    t.string('status').notNullable().defaultTo('active');
    t.integer('user_id').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gwo_spare_parts');
};
