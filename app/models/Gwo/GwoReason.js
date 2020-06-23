const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);

// General Work Order
var GwoReason = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_reasons',
});

module.exports = GwoReason;
