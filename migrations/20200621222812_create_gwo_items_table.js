
exports.up = function(knex, Promise) {
  return knex.schema.createTable('gwo_items', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('gwo_id').unsigned().references('id').inTable('gwo').onDelete('cascade');
    t.integer('node_id').unsigned().references('id').inTable('nodes').onDelete('cascade');

    t.text('notes').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gwo_items');
};
