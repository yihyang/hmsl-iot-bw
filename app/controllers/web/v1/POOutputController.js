const rootPath = './../../../..'
let shortfall = require('./POOutputs/ShortfallController')
const PoOutput = require(`${rootPath}/app/models/PoOutput/PoOutput`)

let index = async function(req, res) {
  let poOutputs = (
    await new PoOutput().query(qb => {
      qb.orderBy('id', 'DESC')
    })
    .fetchAll({withRelated: 'user'})
  ).toJSON();

  res.render('web/v1/po-outputs/index', {poOutputs})
}

module.exports = {
  index,
  shortfall
}
