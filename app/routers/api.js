const rootPath = './../..'
const api = require(`${rootPath}/app/controllers/api`)
const passport = require('passport')
const {respondSuccess} = require(`${rootPath}/app/helpers/response`)

let skipAuthticationPath = [];

module.exports = (app) => {
  app.get('/_ping', function(req, res) {
    res.status(200).json(
      respondSuccess(
        'Success',
        'Successfully pinged the server'
      )
    );
  });

  app.post('/auth', api.auth.authenticate)
  app.post('/auth/employee-id', api.auth.authenticateWithEmployeeId)

  // app the path that starts with /api/v1 will be authenticated
  app.use('/v1', function(req, res, next) {
    if (!skipAuthticationPath.includes(req.url)) {
      passport.authenticate('userHttpBearer', {
        session: false
      })(req, res, next);
    } else {
      next();
    }
  });

  app.get('/v1/nodes/name/:name', api.v1.node.showByName)
  app.post('/v1/po-records', api.v1.poRecord.save)
  app.get('/v1/po-records/po-number/:poNumber', api.v1.poRecord.showByPoNumber)
  app.post('/v1/po-records/:id/end', api.v1.poRecord.end)
  app.get('/v1/po-records/latest/nodes/name/:name', api.v1.poRecord.latestPoByNodeNumber)
  app.post('/v1/po-jobs', api.v1.poJob.save)
  app.post('/v1/po-job-inputs', api.v1.poJobInput.save)
  app.post('/v1/po-batches', api.v1.poBatch.save)
}
