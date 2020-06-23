const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Gwo = require('./Gwo');
const GwoItemSparePartUsage = require('./GwoItemSparePartUsage');
const Node = require('./../Node/Node');

// General Work Order
var GwoItem = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_items',
  gwo() {
    return this.belongsTo(Gwo);
  },
  node() {
    return this.belongsTo(Node);
  },
  spare_part_usages() {
    return this.hasMany(GwoItemSparePartUsage);
  }
});

module.exports = GwoItem;
