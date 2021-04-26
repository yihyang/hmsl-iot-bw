const moment = require('moment');

const rootPath = './../../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const User = require(`${rootPath}/app/models/Account/User`);
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`);
const PoJob = require('./../PoJob');

const PoJobInput = bookshelf.model('PoJobInput', {
  hasTimestamps: true,
  tableName: 'po_job_inputs',
  soft: ['deleted_at'], // soft delete
  initialize() {
    this.on('saved', async (model) => {
      await require('./../PoJob').updateInputQuantity(model.id);
      await PoRecord.updateInputQuantity(model.id);
    })
  },
  po_job() {
    return this.belongsTo(PoJob)
  },
  user() {
    return this.belongsTo(User)
  }
}, {
});

module.exports = PoJobInput;
