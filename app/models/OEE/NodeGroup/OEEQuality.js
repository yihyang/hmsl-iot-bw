const rootPath = './../../../..'
const bookshelf = require(`${rootPath}/config/bookshelf`)
const NodeGroup = require(`${rootPath}/app/models/Node/NodeGroup`)

const NodeGroupOEEQuality = bookshelf.model('NodeGroupOEEQuality', {
  hasTimestamps: true,
  tableName: 'node_group_oee_qualities',
  soft: ['deleted_at'],
  nodeGroup() {
    return this.belongsTo(NodeGroup)
  }
})

module.exports = NodeGroupOEEQuality
