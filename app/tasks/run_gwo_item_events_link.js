require('dotenv').config()
const rootPath = './../..'

const GwoItem = require(`${rootPath}/app/models/Gwo/GwoItem`)

let main = async (payload, helpers) => {
  let { gwo_item_id } = payload
  await GwoItem.createOrUpdateFromGwoItem(gwo_item_id)
}

module.exports = main
