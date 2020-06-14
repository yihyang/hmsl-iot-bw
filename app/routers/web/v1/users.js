const web = require('./../../../controllers/web')


module.exports = (app) => {
    app.get('/sign-up', web.v1.users.add)
    app.post('/sign-up', web.v1.users.save)
    app.get('/sign-in', web.v1.users.sign_in)
    app.post(
      '/sign-in',
      web.v1.users.new_session
    )
    app.get('/sign-out', web.v1.users.sign_out)
}
