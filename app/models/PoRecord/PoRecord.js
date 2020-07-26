const moment = require('moment');

const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const User = require('./../Account/User');
const PoJob = require('./PoJob');

const PoRecord = bookshelf.model('PoRecord', {
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
  }
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
  }
});

module.exports = PoRecord;
