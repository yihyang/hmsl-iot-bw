const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const User = require('./../Account/User');
const PoJob = require('./PoJob');
const PoRecord = require('./PoRecord');

const PoBatch = bookshelf.model('PoBatch', {
  hasTimestamps: true,
  tableName: 'po_batches',
  initialize() {
    this.on('saved', (model) => {
      PoRecord.updateOutputQuantity(model.id);
      require('./PoJob').updateOutputQuantity(model.id);
    })
  },
  po_job() {
    return this.belongsTo(PoJob)
  },
  user() {
    return this.belongsTo(User)
  }
});

module.exports = PoBatch;
