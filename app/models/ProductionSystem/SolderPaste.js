const rootPath = './../../..'
const bookshelf = require(`${rootPath}/config/bookshelf`)

const User = require(rootPath + '/app/models/Account/User')

const SolderPaste = bookshelf.model('ProductionSystem/SolderPaste', {
  hasTimestamps: true,
  tableName: 'ps_solder_pastes',
  soft: ['deleted_at'], // soft delete
  creator() {
    return this.belongsTo(User, 'creator_id')
  }
})

module.exports = SolderPaste
