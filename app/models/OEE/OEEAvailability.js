const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);

const OEEAvailability = bookshelf.model('OEEAvailability', {
  hasTimestamps: true,
  tableName: 'oee_availabilities',
  oee() {
    return this.belongsTo(OEE)
  }
})

module.exports = OEEAvailability;
