const moment = require('moment');

const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require('./../Node/Node');
const User = require('./../Account/User');
const PoRecord = require('./PoRecord');
const PoBatch = require('./PoBatch');
const PoJobInput = require('./PoJob/PoJobInput');

const PoJob = bookshelf.model('PoJob', {
  hasTimestamps: true,
  tableName: 'po_jobs',
  initialize() {
    this.on('saved', async (model) => {
      // let poRecord = await new PoRecord({id: model.po_record_id}).fetch({require: false});
      let poRecord = model.po_record({require: false});
      if (poRecord && ((await poRecord.fetch({require: false})).toJSON().status != 'In Progress')) {
        poRecord.set('status', 'In Progress')
        poRecord.set('start_time', moment())
        poRecord.save()
      }
    })
  },
  ended_by() {
    return this.belongsTo(User, 'ended_by')
  },
  po_record() {
    return this.belongsTo(PoRecord)
  },
  po_job_inputs() {
    return this.hasMany(PoJobInput)
  },
  po_batches() {
    return this.hasMany(PoBatch)
  },
  node() {
    return this.belongsTo(require('./../Node/Node'))
  },
  user() {
    return this.belongsTo(User)
  },
}, {
  statuses() {
    return ['In Progress', 'Completed']
  },
  async updateOutputQuantity(poBatchId) {
    let query = `
    UPDATE po_jobs
    SET produced_quantity = reference.output_quantity
    FROM
    (
      SELECT po_jobs.id, sum(output_quantity) AS output_quantity
      FROM po_batches
      JOIN po_jobs ON po_batches.po_job_id = po_jobs.id
      WHERE po_jobs.id IN
      (
        SELECT po_jobs.id
        FROM po_batches
        JOIN po_jobs ON po_batches.po_job_id = po_jobs.id
        WHERE po_batches.id = ?
      )
      GROUP BY po_jobs.id
    ) AS reference
    WHERE po_jobs.id = reference.id
    `

    await bookshelf.knex.raw(query, poBatchId);
  },
  async updateInputQuantity(poJobInputId) {
    let query = `
      UPDATE po_jobs
      SET input_quantity = reference.input_quantity
      FROM
      (
        SELECT po_jobs.id, sum(po_job_inputs.quantity) AS input_quantity
        FROM po_job_inputs
        JOIN po_jobs ON po_job_inputs.po_job_id = po_jobs.id
        WHERE po_jobs.id IN
        (
          SELECT po_jobs.id
          FROM po_job_inputs
          JOIN po_jobs ON po_job_inputs.po_job_id = po_jobs.id
          WHERE po_job_inputs.id = ?
        )
        GROUP BY po_jobs.id
      ) AS reference
      WHERE po_jobs.id = reference.id
    `;

    await bookshelf.knex.raw(query, poJobInputId);
  }
});

module.exports = PoJob;
