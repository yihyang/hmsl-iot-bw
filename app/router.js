const mapWebV1PortalRoutes = require('./routers/web/v1/portal')
const mapUsersRoutes = require('./routers/web/v1/users');
const web = require('./controllers/web')
const mapApiRoutes = require('./routers/api');
// const Area = require('./models/Node/Area/Area')
const { apiAuthentication, webAuthentication } = require('./helpers/authentication');
var passport = require('../config/passport-initialize');

module.exports = (app) => {
  // Inject areas into all requests for all to use
  // TODO: Consider moving this into cache
  // async function insertArea(req, res, next) {
  //   // res.locals.areas = (await new Area().fetchAll()).toJSON()
  //   next()
  // }

  app.post('/auth', )
  app.use('/portal', webAuthentication);

  app.get('/', web.v1.home.index)
  app.prefix('/portal', function(portal) {
    mapWebV1PortalRoutes(portal)
  });
  app.prefix('/api', function(api) {
    mapApiRoutes(api)
  });

  mapUsersRoutes(app);
}
