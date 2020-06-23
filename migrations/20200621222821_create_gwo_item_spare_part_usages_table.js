
exports.up = function(knex, Promise) {
  return knex.schema.createTable('gwo_item_spare_part_usages', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('gwo_item_id').unsigned().references('id').inTable('gwo_items').onDelete('cascade');
    t.integer('gwo_spare_part_id').unsigned().references('id').inTable('gwo_spare_parts').onDelete('cascade');

    t.integer('spare_part_quantity').notNullable().defaultTo(0);

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gwo_item_spare_part_usages');
};
