const mapWebV1PortalRoutes = require('./routers/web/v1/portal')
const mapUsersRoutes = require('./routers/web/v1/users');
const web = require('./controllers/web')
const mapApiRoutes = require('./routers/api');
// const Area = require('./models/Node/Area/Area')
const { apiAuthentication, webAuthentication } = require('./helpers/authentication');
var passport = require('../config/passport-initialize');

module.exports = (app, tmpUpload) => {

  app.post('/auth', )
  app.use('/oee', webAuthentication);
  app.use('/nodes', webAuthentication);
  app.use('/portal', webAuthentication);
  app.use('/po-outputs', webAuthentication);

  app.get('/', web.v1.home.index)

  mapWebV1PortalRoutes(app, tmpUpload)

  app.prefix('/api', function(api) {
    mapApiRoutes(api)
  });

  mapUsersRoutes(app);
}
