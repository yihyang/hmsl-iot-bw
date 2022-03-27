const rootPath = './../../..';

const _ = require('lodash')

const OEE = require(`${rootPath}/app/models/OEE/OEE`);
const Node = require(`${rootPath}/app/models/Node/Node`);
const bookshelf = require(`${rootPath}/config/bookshelf`);

const OEECapacity = bookshelf.model('OEECapacity', {
  hasTimestamps: true,
  tableName: 'oee_qualities',
  soft: ['deleted_at'],
  oee() {
    return this.belongsTo(OEE)
  },
  node() {
    return this.belongsTo(Node)
  },
}, {
})

module.exports = OEECapacity;
