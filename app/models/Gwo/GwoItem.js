const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Gwo = require('./Gwo');
const GwoItemSparePartUsage = require('./GwoItemSparePartUsage');
const Node = require('./../Node/Node');
const moment = require('moment')
const { oeeReworkQueue } = require(`${rootPath}/app/queues/oee_rework`)

// General Work Order
var GwoItem = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_items',
  initialize() {
    this.on('saved', async (model, attrs) => {
      let gwo  = await model.gwo().fetch()
      // set the OEE availabilities 'need_rework' = true
      // set the OEE performances 'need_rework' = true

      let { start_time, end_time} = gwo.attributes
      let node_id = model.attributes.node_id
      let date = moment(start_time).format('YYYY-MM-DD')
      oeeReworkQueue.add({node_id, date, group: ['performance']})
    })
  },
  gwo() {
    return this.belongsTo(require('./Gwo'));
  },
  node() {
    return this.belongsTo(Node);
  },
  spare_part_usages() {
    return this.hasMany(GwoItemSparePartUsage);
  }
});

module.exports = GwoItem;
