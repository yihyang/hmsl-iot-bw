require('dotenv').config();

const rootPath = './..'
const GwoItem = require(`${rootPath}/app/models/gwo/GwoItem`)

let runJob = async () => {
  await GwoItem.createOrUpdateFromGwoItem()
}

runJob()
