const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const Node = require(`${rootPath}/app/models/Node/Node`);

const OEE = bookshelf.model('OEE', {
  hasTimestamps: true,
  tableName: 'oee',
  soft: ['deleted_at'],
  node() {
    return this.belongsTo(Node)
  }
})

module.exports = OEE;
