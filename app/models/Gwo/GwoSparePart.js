const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);

// General Work Order
var GwoSparePart = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_spare_parts',
});

module.exports = GwoSparePart;
