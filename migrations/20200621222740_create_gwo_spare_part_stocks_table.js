
exports.up = function(knex, Promise) {
  return knex.schema.createTable('gwo_spare_part_stocks', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('gwo_spare_part_id').unsigned().references('id').inTable('gwo_spare_parts').onDelete('cascade');
    t.integer('quantity').notNullable();
    t.integer('user_id').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gwo_spare_part_stocks');
};
