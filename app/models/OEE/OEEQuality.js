const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);

const OEEQuality = bookshelf.model('OEEQuality', {
  hasTimestamps: true,
  tableName: 'oee_qualities',
  oee() {
    return this.belongsTo(OEE)
  }
})

module.exports = OEEQuality;
