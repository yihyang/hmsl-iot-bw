const web = require('./../../../controllers/web')


module.exports = (app, tmpUpload) => {
    app.get('/portal', web.v1.home.index)

    app.get('/po-records', web.v1.poRecords.index)
    app.post('/po-records/shortfall', tmpUpload.single('file'), web.v1.poRecords.shortfall.upload)

    app.get('/nodes', web.v1.nodes.index)

    app.get('/gwo', web.v1.gwo.index)
    app.get('/gwo/new', web.v1.gwo.add)
    // app.get('/gwo/:id/edit', web.v1.gwo.edit)
    // app.post('/gwo/:id/update', web.v1.gwo.update)
    app.post('/gwo', web.v1.gwo.save)

    app.get('/gwo/settings', web.v1.gwo.settings.index)

    app.get('/gwo/:id', web.v1.gwo.show)


    app.get('/gwo/settings/reasons', web.v1.gwo.settings.reasons.index)
    app.get('/gwo/settings/reasons/new', web.v1.gwo.settings.reasons.add)
    app.get('/gwo/settings/reasons/:id/edit', web.v1.gwo.settings.reasons.edit)
    app.post('/gwo/settings/reasons/:id/update', web.v1.gwo.settings.reasons.update)
    app.post('/gwo/settings/reasons', web.v1.gwo.settings.reasons.save)

    app.get('/gwo/settings/spare-parts', web.v1.gwo.settings.spareParts.index)
    app.get('/gwo/settings/spare-parts/new', web.v1.gwo.settings.spareParts.add)
    app.get('/gwo/settings/spare-parts/:id/edit', web.v1.gwo.settings.spareParts.edit)
    app.post('/gwo/settings/spare-parts/:id/update', web.v1.gwo.settings.spareParts.update)
    app.post('/gwo/settings/spare-parts', web.v1.gwo.settings.spareParts.save)

    app.get('/oee', web.v1.oee.index)
    app.get('/oee/daily-time-inputs', web.v1.oee.dailyTimeInputs.index)
    app.get('/oee/daily-time-inputs/fetch-by-date', web.v1.oee.dailyTimeInputs.fetchByDate)
    app.get('/oee/daily-time-inputs/update', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/:nodeId/:schedule(am|pm)', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/set-default-values', web.v1.oee.dailyTimeInputs.setDefaultValues)
}
