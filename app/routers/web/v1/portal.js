const web = require('./../../../controllers/web')


module.exports = (app, tmpUpload) => {
    app.get('/portal', web.v1.home.index)

    app.get('/po-outputs', web.v1.poOutputs.index)
    app.post('/po-outputs/shortfall', tmpUpload.single('file'), web.v1.poOutputs.shortfall.upload)

    app.get('/nodes', web.v1.nodes.index)

    app.get('/oee', web.v1.oee.index)
    app.get('/oee/daily-time-inputs', web.v1.oee.dailyTimeInputs.index)
    app.get('/oee/daily-time-inputs/fetch-by-date', web.v1.oee.dailyTimeInputs.fetchByDate)
    app.get('/oee/daily-time-inputs/update', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/:nodeId/:schedule(am|pm)', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/set-default-values', web.v1.oee.dailyTimeInputs.setDefaultValues)
}
