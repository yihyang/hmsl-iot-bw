const moment = require('moment');

const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const User = require('./../Account/User');
const PoJob = require('./PoJob');

const PoRecord = bookshelf.model('PoRecord', {
  soft: ['deleted_at'],
  hasTimestamps: true,
  tableName: 'po_records',
  initialize() {
    this.on('creating', function(model, attrs, options) {
      if (attrs.status == null) {
        attrs.status = 'Created'
      }
    }),
    this.on('saving', function(model, attrs, options) {
      // insert duration if the PO Record has been set to ended
      let {
        status,
        start_time,
        end_time,
      } = attrs;
      if (status === 'Ended' && (start_time && !end_time)) {
        let endTime = moment()
        attrs.end_time = endTime
        attrs.duration = endTime.diff(moment(start_time))
      }
    })
  },
  jobs() {
    return this.hasMany(require('./PoJob'))
  },
  user() {
    return this.belongsTo(User)
  },
  async total_input_quantity() {
    let query = `
      SELECT COALESCE(SUM(po_job_inputs.quantity), 0) AS result
        FROM po_records
        JOIN po_jobs ON po_records.id = po_jobs.po_record_id
        JOIN po_job_inputs ON po_jobs.id = po_job_inputs.po_job_id
        WHERE po_records.id = ?
    `

    return (await bookshelf.knex.raw(query, this.id)).rows[0].result;
  },
}, {
  statuses() {
    return ['Created', 'In Progress', 'Ended']
  },
  async updateOutputQuantity(poBatchId) {
    let query = `
    UPDATE po_records
    SET produced_quantity = reference.output_quantity
    FROM
    (
      SELECT po_records.id, sum(output_quantity) AS output_quantity
      FROM po_batches
      JOIN po_jobs ON po_batches.po_job_id = po_jobs.id
      JOIN po_records ON po_jobs.po_record_id = po_records.id
      WHERE po_records.id IN
      (
        SELECT po_records.id
        FROM po_batches
        JOIN po_jobs ON po_batches.po_job_id = po_jobs.id
        JOIN po_records ON po_jobs.po_record_id = po_records.id
        WHERE po_batches.id = ?
      )
      GROUP BY po_records.id
    ) AS reference
    WHERE po_records.id = reference.id
    `

    await bookshelf.knex.raw(query, poBatchId);
  },
  async updateInputQuantity(poJobInputId) {
    let query = `
      UPDATE po_records
      SET input_quantity = reference.input_quantity
      FROM
      (
        SELECT po_records.id, sum(po_job_inputs.quantity) AS input_quantity
        FROM po_job_inputs
        JOIN po_jobs ON po_job_inputs.po_job_id = po_jobs.id
        JOIN po_records ON po_jobs.po_record_id = po_records.id
        WHERE po_records.id IN
        (
          SELECT po_records.id
          FROM po_job_inputs
          JOIN po_jobs ON po_job_inputs.po_job_id = po_jobs.id
          JOIN po_records ON po_jobs.po_record_id = po_records.id
          WHERE po_job_inputs.id = ?
        )
        GROUP BY po_records.id
      ) AS reference
      WHERE po_records.id = reference.id
    `;

    await bookshelf.knex.raw(query, poJobInputId);
  }
});

module.exports = PoRecord;
