
exports.up = function(knex, Promise) {
  return knex.schema.createTable('po_jobs', function(t) {
    t.increments('id').unsigned().primary();

    t.integer('po_record_id').unsigned().references('id').inTable('po_records').onDelete('cascade');
    t.integer('node_id').unsigned().references('id').inTable('nodes').onDelete('cascade');
    t.string('status').nullable();
    t.integer('user_id').nullable();

    t.dateTime('ended_at').nullable().defaultTo(null);
    t.integer('ended_by').nullable().defaultTo(null);

    t.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'));
    t.dateTime('updated_at').nullable().defaultTo(null);
    t.dateTime('deleted_at').nullable().defaultTo(null);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('po_jobs');
};
