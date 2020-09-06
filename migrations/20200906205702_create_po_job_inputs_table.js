
exports.up = function(knex, Promise) {
  return knex.schema.createTable('po_job_inputs', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('po_job_id').unsigned().references('id').inTable('po_jobs').onDelete('cascade');

    t.double('quantity').nullable().defaultTo(0);
    t.integer('user_id').nullable();

    t.timestamps();
    t.dateTime('deleted_at').nullable().defaultTo(null);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('po_job_inputs');
};
