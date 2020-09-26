const rootPath = './../../../../..';
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const {
  filterParams,
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`)


let index = async function(req, res) {
    let {id} = req.params;
    let paginationAttribute = getPaginationAttributes(req);

    let poJobs = await new PoJob().query(function(query) {
      query
        .where('po_record_id', id)
        .offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'DESC')
    .fetchAll({
      withRelated: [
      {
        'po_job_inputs': function(qb) {
          qb.orderBy('id', 'DESC')
        },
      },
      'po_job_inputs.user',
      'node'
      ]
    });

    let totalCount = await new PoJob().query(function(query) {
      query
        .where('po_record_id', id)
    }).count('*');
    let total_page = Math.ceil(parseInt(totalCount) / paginationAttribute.items_per_page);
    poJobs = poJobs.toJSON();

    res.render('web/v1/po-records/po-jobs/index', {poJobs, id, ...paginationAttribute, total_page})
}

module.exports = {
  index
}
