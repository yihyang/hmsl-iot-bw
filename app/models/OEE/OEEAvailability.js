const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const Node = require(`${rootPath}/app/models/Node/Node`);

const OEEAvailability = bookshelf.model('OEEAvailability', {
  hasTimestamps: true,
  tableName: 'oee_availabilities',
  soft: ['deleted_at'],
  oee() {
    return this.belongsTo(OEE)
  },
  node() {
    return this.belongsTo(Node)
  }
})

module.exports = OEEAvailability;
