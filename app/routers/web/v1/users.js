const rootPath = './../../../..';
const web = require(`${rootPath}/app/controllers/web`)
const { ENABLE_SIGNUP } = require(`${rootPath}/config/settings`)


module.exports = (app) => {
    if (ENABLE_SIGNUP) {
      app.get('/sign-up', web.v1.users.add)
      app.post('/sign-up', web.v1.users.save)
    }
    app.get('/sign-in', web.v1.users.sign_in)
    app.post(
      '/sign-in',
      web.v1.users.new_session
    )
    app.get('/sign-out', web.v1.users.sign_out)
}
