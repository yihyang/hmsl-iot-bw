exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(t) {
    t.increments('id').unsigned().primary();

    t.string('username').notNullable().unique();
    t.string('password').notNullable();
    t.string('name');

    t.string('employee_id').nullable();
    t.string('access_token').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
