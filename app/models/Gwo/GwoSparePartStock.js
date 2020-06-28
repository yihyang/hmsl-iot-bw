const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const GwoSparePart = require('./GwoSparePart');
const User = require(`${rootPath}/app/models/Account/User`);

// General Spare Part Stock
var GwoSparePartStock = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_spare_part_stocks',
  initialize() {
    this.on('saved', (model) => {
      let {gwo_spare_part_id} = model.attributes;
      if (gwo_spare_part_id) {
        require('./GwoSparePart').updateCurrentQuantity(gwo_spare_part_id);
      }
    })
  },
  sparePart() {
    return this.belongsTo(GwoSparePart)
  },
  user() {
    return this.belongsTo(User)
  }
});

module.exports = GwoSparePartStock;
