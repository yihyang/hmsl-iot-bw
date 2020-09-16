const web = require('./../../../controllers/web')


module.exports = (app, tmpUpload) => {
    app.get('/portal', web.v1.home.index)

    app.get('/po-records', web.v1.poRecords.index)
    app.post('/po-records/shortfall', tmpUpload.single('file'), web.v1.poRecords.shortfall.upload)
    app.get('/po-records/:id', web.v1.poRecords.show)
    app.get('/po-records/:id/edit', web.v1.poRecords.edit)
    app.post('/po-records/:id/update', web.v1.poRecords.update)
    app.get('/po-records/:id/jobs', web.v1.poRecords.jobs.index)

    app.get('/nodes', web.v1.nodes.index)
    app.get('/nodes/:id', web.v1.nodes.show)
    app.get('/nodes/:id/events', web.v1.nodes.events.index)

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
    app.post('/gwo/settings/reasons/:id/update', web.v1.gwo.settings.reasons.update)
    app.post('/gwo/settings/reasons', web.v1.gwo.settings.reasons.save)

    app.get('/gwo/settings/spare-parts', web.v1.gwo.settings.spareParts.index)
    app.get('/gwo/settings/spare-parts/new', web.v1.gwo.settings.spareParts.add)
    app.get('/gwo/settings/spare-parts/:id/edit', web.v1.gwo.settings.spareParts.edit)
    app.post('/gwo/settings/spare-parts/:id/update', web.v1.gwo.settings.spareParts.update)
    app.post('/gwo/settings/spare-parts', web.v1.gwo.settings.spareParts.save)
    app.get('/gwo/settings/spare-parts/:sparePartId/stocks/new', web.v1.gwo.settings.spareParts.stocks.add)
    app.get('/gwo/settings/spare-parts/:sparePartId/stocks', web.v1.gwo.settings.spareParts.stocks.index)
    app.post('/gwo/settings/spare-parts/:sparePartId/stocks', web.v1.gwo.settings.spareParts.stocks.save)

    app.get('/oee', web.v1.oee.index)
    app.get('/oee/details', web.v1.oee.details.index)
    app.get('/oee/details/refresh', web.v1.oee.details.refresh)
    app.get('/oee/dashboard', web.v1.oee.dashboard.index)
    app.get('/oee/dashboard/refresh', web.v1.oee.dashboard.refresh)
    app.get('/oee/daily-time-inputs', web.v1.oee.dailyTimeInputs.index)
    app.get('/oee/daily-time-inputs/fetch-by-date', web.v1.oee.dailyTimeInputs.fetchByDate)
    app.get('/oee/daily-time-inputs/update', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/:nodeId/:schedule(am|pm)', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/set-default-values', web.v1.oee.dailyTimeInputs.setDefaultValues)

    app.get('/settings', web.v1.settings.index)
    app.get('/settings/users', web.v1.settings.users.index)
    app.get('/settings/users/:id/edit', web.v1.settings.users.edit)
    app.post('/settings/users/:id/update', web.v1.settings.users.update)
}
