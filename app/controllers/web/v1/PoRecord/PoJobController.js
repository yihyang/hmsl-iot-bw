const rootPath = './../../../../..';
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)


let index = async function(req, res) {
    let {id} = req.params;

    let poJobs = await new PoJob().query(function(query) {
      query.where('po_record_id', id)
    }).fetchAll({withRelated: ['po_job_inputs.user', 'node']});

    poJobs = poJobs.toJSON();

    res.render('web/v1/po-records/po-jobs/index', {poJobs, id})
}

module.exports = {
  index
}
