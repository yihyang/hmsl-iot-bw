const web = require('./../../../controllers/web')


module.exports = (app, tmpUpload) => {
    app.get('/portal', web.v1.home.index)

    app.get('/po-records', web.v1.poRecords.index)
    app.get('/po-records/index-search', web.v1.poRecords.indexSearch)
    app.get('/po-records/new', web.v1.poRecords.add)
    app.post('/po-records', web.v1.poRecords.save)
    app.post('/po-records/shortfall', tmpUpload.single('file'), web.v1.poRecords.shortfall.upload)
    // app.get('/po-records/:id/po-inputs/new', web.v1.poRecords.poInputs.add)
    // app.post('/po-records/:id/po-inputs', web.v1.poRecords.poInputs.save)
    app.get('/po-records/:id', web.v1.poRecords.show)
    app.get('/po-records/:id/edit', web.v1.poRecords.edit)
    app.post('/po-records/:id/update', web.v1.poRecords.update)
    app.post('/po-records/:id/restart', web.v1.poRecords.restart)
    app.get('/po-records/:id/jobs', web.v1.poRecords.jobs.index)
    app.get('/po-records/:id/jobs/new', web.v1.poRecords.jobs.add)
    app.post('/po-records/:id/jobs', web.v1.poRecords.jobs.save)

    app.get('/po-jobs/:id', web.v1.poJobs.show)
    app.get('/po-jobs/:id/inputs/:inputId/edit', web.v1.poJobs.poJobInputs.edit)
    app.post('/po-jobs/:id/inputs/:inputId/update', web.v1.poJobs.poJobInputs.update)
    app.post('/po-jobs/:id/inputs/:inputId/destroy', web.v1.poJobs.poJobInputs.destroy)
    app.get('/po-jobs/:id/batches/:batchId/edit', web.v1.poJobs.poBatches.edit)
    app.post('/po-jobs/:id/batches/:batchId/update', web.v1.poJobs.poBatches.update)
    app.post('/po-jobs/:id/batches/:batchId/destroy', web.v1.poJobs.poBatches.destroy)

    app.get('/nodes', web.v1.nodes.index)
    app.get('/nodes/:id', web.v1.nodes.show)
    app.get('/nodes/:id/events', web.v1.nodes.events.index)

    app.get('/mean-times', web.v1.meanTimes.index)
    app.get('/mean-times/refresh', web.v1.meanTimes.refresh)

    app.get('/gwo', web.v1.gwo.index)
    app.get('/gwo/new', web.v1.gwo.add)
    // app.get('/gwo/:id/edit', web.v1.gwo.edit)
    // app.post('/gwo/:id/update', web.v1.gwo.update)
    app.post('/gwo', web.v1.gwo.save)
    app.get('/gwo/settings', web.v1.gwo.settings.index)
    app.get('/gwo/:id', web.v1.gwo.show)
    app.get('/gwo/:id/edit', web.v1.gwo.edit)
    app.post('/gwo/:id/update', web.v1.gwo.update)

    app.get('/extrusion-cycles', web.v1.extrusionCycles.index)
    app.put('/extrusion-cycles', web.v1.extrusionCycles.update)

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
    app.get('/oee/dashboard/reason-refresh', web.v1.oee.dashboard.reasonRefresh)
    app.get('/oee/dashboard/history-refresh', web.v1.oee.dashboard.historyRefresh)
    app.get('/oee/daily-time-inputs', web.v1.oee.dailyTimeInputs.index)
    app.get('/oee/daily-time-inputs/fetch-by-date', web.v1.oee.dailyTimeInputs.fetchByDate)
    app.get('/oee/daily-time-inputs/update', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/:nodeId/:schedule(am|pm)', web.v1.oee.dailyTimeInputs.update)
    app.put('/oee/daily-time-inputs/set-default-values', web.v1.oee.dailyTimeInputs.setDefaultValues)

    app.get('/settings', web.v1.settings.index)
    app.get('/settings/users', web.v1.settings.users.index)
    app.get('/settings/users/new', web.v1.settings.users.add)
    app.post('/settings/users', web.v1.settings.users.save)
    app.get('/settings/users/:id/edit', web.v1.settings.users.edit)
    app.post('/settings/users/:id/update', web.v1.settings.users.update)

    app.get('/operators', web.v1.operators.index)
    app.get('/operators/input-materials/step-1', web.v1.operators.inputMaterials.step1)
    app.post('/operators/input-materials/step-2', web.v1.operators.inputMaterials.step2)
    app.post('/operators/input-materials', web.v1.operators.inputMaterials.save)
    app.get('/operators/po-inputs/step-1', web.v1.operators.poInputs.step1)
    app.get('/operators/po-inputs/po-records/new', web.v1.operators.poInputs.poRecords.add)
    app.get('/operators/po-inputs/po-records/:id', web.v1.operators.poInputs.poRecords.show)
    app.get('/operators/po-inputs/po-records/:id/po-jobs/new', web.v1.operators.poInputs.poRecords.poJobs.add)
    app.post('/operators/po-inputs/po-records/:id/po-jobs', web.v1.operators.poInputs.poRecords.poJobs.save)
    app.post('/operators/po-inputs/po-records', web.v1.operators.poInputs.poRecords.save)
    app.post('/operators/po-inputs/step-2', web.v1.operators.poInputs.step2)
    app.post('/operators/po-inputs', web.v1.operators.poInputs.save)
    app.get('/operators/po-checkout/step-1', web.v1.operators.poCheckout.step1)
    app.post('/operators/po-checkout/step-2', web.v1.operators.poCheckout.step2)
    app.post('/operators/po-checkout', web.v1.operators.poCheckout.save)
    app.get('/operators/po-end/step-1', web.v1.operators.poEnd.step1)
    app.post('/operators/po-end/step-2', web.v1.operators.poEnd.step2)
    app.post('/operators/po-end', web.v1.operators.poEnd.end)

}
