const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const GwoItem = require('./GwoItem');
const SparePart = require('./GwoSparePart');

// General Work Order
var GwoItemSparePartUsage = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_item_spare_part_usages',
  spare_part() {
    return this.belongsTo(SparePart);
  },
  gwo_item() {
    return this.belongsTo(GwoItem);
  }
});

module.exports = GwoItemSparePartUsage;
