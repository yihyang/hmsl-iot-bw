const rootPath = './../..'
const api = require(`${rootPath}/app/controllers/api`)

module.exports = (app) => {
  app.post('/auth', api.auth.authenticate)
  app.post('/auth/employee-id', api.auth.authenticateWithEmployeeId)
}
