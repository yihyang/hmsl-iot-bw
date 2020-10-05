
exports.up = function(knex, Promise) {
  return knex.schema.createTable('extrusion_cycles', function(t) {
    t.increments('id').unsigned().primary();


    t.string('category').nullable();
    t.string('alloy').nullable();
    t.string('billet_size').nullable();
    t.double('diameter').nullable();
    t.json('data').nullable();


    t.timestamps();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('extrusion_cycles');
};
