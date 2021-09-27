const rootPath = './../../../..'
const bookshelf = require(`${rootPath}/config/bookshelf`)
const NodeGroup = require(`${rootPath}/app/models/Node/NodeGroup`)

const NodeGroupOEE = bookshelf.model('NodeGroupOEE', {
  hasTimestamps: true,
  tableName: 'node_group_oee',
  soft: ['deleted_at'],
  nodeGroup() {
    return this.belongsTo(NodeGroup)
  }
})

module.exports = NodeGroupOEE
