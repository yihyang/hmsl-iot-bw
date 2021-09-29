const rootPath = './../../..';

const _ = require('lodash')

const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const Node = require(`${rootPath}/app/models/Node/Node`);
const bookshelf = require(`${rootPath}/config/bookshelf`);

const OEEQuality = bookshelf.model('OEEQuality', {
  hasTimestamps: true,
  tableName: 'oee_qualities',
  soft: ['deleted_at'],
  oee() {
    return this.belongsTo(OEE)
  },
  node() {
    return this.belongsTo(Node)
  },
}, {
  amSiteQualityQuery(nodeIds) {
    let nodeIdsIdentifier = _.map(nodeIds, () => '?').join(',')

    return `
      SELECT
        CASE
          WHEN sum(po_jobs.input_quantity) = 0 THEN 0
          ELSE sum(po_jobs.produced_quantity) / sum(po_jobs.input_quantity)
          END AS value,
        date(po_jobs.created_at)
        FROM po_jobs
        WHERE date(po_jobs.created_at) = ?
        AND node_id IN (${nodeIdsIdentifier})
        GROUP BY date(po_jobs.created_at)
      `
  },
  bwSiteQualityQuery(nodeIds) {
    let nodeIdsIdentifier = _.map(nodeIds, () => '?').join(',')

    return `
        SELECT
          CASE
            WHEN sum(po_jobs.input_quantity) = 0 THEN 0
            ELSE sum(po_jobs.produced_quantity) / sum(po_jobs.input_quantity)
          END AS value,
        date(po_jobs.created_at)
        FROM po_records
        JOIN po_jobs ON po_records.id = po_jobs.po_record_id
        WHERE date(po_records.created_at) = ?
        AND node_id IN (${nodeIdsIdentifier})
        GROUP BY date(po_jobs.created_at)
      `
  }
})

module.exports = OEEQuality;
