const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const moment = require('moment');

const ExtrusionCycle = bookshelf.model('ExtrusionCycle', {
  hasTimestamps: true,
  tableName: 'extrusion_cycles'
});

module.exports = ExtrusionCycle
