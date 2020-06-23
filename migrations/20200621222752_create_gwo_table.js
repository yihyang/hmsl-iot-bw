
exports.up = function(knex, Promise) {
  return knex.schema.createTable('gwo', function(t) {
    t.increments('id').unsigned().primary();

    t.string('type').nullable();
    t.dateTime('start_time').nullable();
    t.dateTime('end_time').nullable();
    t.integer('duration').nullable();
    t.integer('gwo_reason_id').nullable();
    t.integer('user_id').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gwo');
};
