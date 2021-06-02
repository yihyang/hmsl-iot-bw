

require('dotenv').config()
const { makeWorkerUtils } = require("graphile-worker");

let dbName = process.env.DB_NAME
let dbPassword = process.env.DB_PASSWORD
let dbUser = process.env.DB_USER
let dbPort = process.env.DB_PORT || 5432
let dbHost = process.env.DB_HOST || 'localhost'
let connectionString = null
if (dbPassword) {
  connectionString = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
} else {
  connectionString = `postgres://${dbUser}@${dbHost}:${dbPort}/${dbName}`
}

let addJob = async (queue, payload) => {
  const workerUtils = await makeWorkerUtils({
    connectionString,
  });

  await workerUtils.addJob(queue, payload)
}


module.exports = {
  connectionString,
  addJob
}
