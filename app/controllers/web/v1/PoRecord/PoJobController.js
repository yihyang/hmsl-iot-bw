const rootPath = './../../../../..'
const PoRecord = require(`${rootPath}/app/models/PoRecord/PoRecord`)
const PoJob = require(`${rootPath}/app/models/PoRecord/PoJob`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const {
  filterParams,
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`)

const moment = require('moment')


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

let add = async (req, res) => {
  let { id } = req.params;
  let poRecord = (await new PoRecord({id}).fetch({require: false}))

  if (!poRecord) {
    req.flash('error', 'Unable to find PO Record')
    return res.redirect(`/po-records`)
  }

  let nodes = (await new Node().fetchAll())
  nodes = nodes.toJSON()

  res.render('web/v1/po-records/po-jobs/add', { nodes, id })
}

let save = async (req, res) => {
  let userId = req.user.id;
  let {id} = req.params;
  let {node_id} = req.body;

  // validate node exists
  let node = (await new Node({id: node_id}).fetch({require: false}))

  if (!node) {
    req.flash('error', 'Unable to find Machine')
    return res.redirect(`/po-records`)
  }

  // validate po record exists
  let poRecord = await new PoRecord({id: id}).fetch({require: false})

  if (!poRecord) {
    req.flash('error', 'Unable to find PO Record')
    return res.redirect(`/po-records/${id}`)
  }

  // create po job
  let poJob = (await new PoJob({po_record_id: id, node_id}).fetch({require: false}))

  if (poJob) {
    req.flash('error', 'PO Job with the same po record and machine found')
    return res.redirect(`/po-records/${id}`)
  }

  poJob = await new PoJob({po_record_id: id, node_id, user_id: userId, status: 'In Progress'}).save();

  // update node to set active PO Job
  await new Node({id: node_id}).save({active_po_job_id: poJob.id}, {patch: true})

  res.redirect(`/po-records/${id}`)
}


let edit = async (req, res) => {

}

let update = async (req, res) => {

}

let destroy = async (req, res) => {
  let { id, jobId } = req.params;
  let job = await getJob(jobId)

  if (!job) {
    req.flash('error', `Unable to find PO Job with ID - ${jobId}`)
    return res.redirect(`/po-records/${id}`)
  }

  job.set('deleted_at', moment())
  job.save()

  req.flash('success', `Successfully deleted PO Job with ID - ${jobId}`)
  res.redirect(`/po-records/${id}`)
}

let getJob = async (id) => {
  return await new PoJob().query(qb => { qb.where('id', id) }).fetch()
}

module.exports = {
  index,
  add,
  save,
  edit,
  update,
  destroy,
}
