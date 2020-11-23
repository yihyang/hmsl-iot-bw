const rootPath = './..';
const mapWebV1PortalRoutes = require('./routers/web/v1/portal')
const mapUsersRoutes = require('./routers/web/v1/users');
const web = require('./controllers/web')
const mapApiRoutes = require('./routers/api');
// const Area = require('./models/Node/Area/Area')
const { apiAuthentication, webAuthentication } = require('./helpers/authentication');
const passport = require(`${rootPath}/config/passport-initialize`);
const settings = require(`${rootPath}/config/settings`);

module.exports = (app, tmpUpload) => {

  // site settings
  app.use('/', function(req, res, next) {
    res.locals.SITE_NAME = settings.SITE_NAME;
    next()
  });

  app.post('/auth')
  app.use('/gwo', webAuthentication);
  app.use('/oee', webAuthentication);
  app.use('/nodes', webAuthentication);
  app.use('/portal', webAuthentication);
  app.use('/po-records', webAuthentication);
  app.use('/extrusion-cycles', webAuthentication);
  app.use('/mean-times', webAuthentication);
  app.use('/operators', webAuthentication);
  app.use('/settings', webAuthentication);

  app.get('/', web.v1.home.index)

  mapWebV1PortalRoutes(app, tmpUpload)

  app.prefix('/api', function(api) {
    mapApiRoutes(api)
  });

  mapUsersRoutes(app);
}
