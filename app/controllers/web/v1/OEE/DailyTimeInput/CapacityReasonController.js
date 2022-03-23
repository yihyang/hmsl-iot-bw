const rootPath = './../../../../../..'

const {
  filterParams,
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`)

const CapacityReason = require(`${rootPath}/app/models/OEE/DailyTimeInput/CapacityReason`)

let index = async (req, res) => {
  let paginationAttribute = getPaginationAttributes(req);

  let reasons = await new CapacityReason()
    .query(function(qb) {
      qb.offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'ASC')
    .fetchAll();

  reasons = reasons.toJSON();
  // pagination
  let reasonCount = await new CapacityReason().count('*');
  let total_page = Math.ceil(parseInt(reasonCount) / paginationAttribute.items_per_page);

  res.render('web/v1/oee/daily-time-inputs/capacity-reasons/index', {
    reasons,
    ...paginationAttribute,
    total_page
  })

}

let add = async (req, res) => {
  res.render('web/v1/oee/daily-time-inputs/capacity-reasons/add')
}

let edit = async (req, res) => {
  let reason = await new CapacityReason({id: req.params.id}).fetch()

  reason = reason.toJSON()

  res.render('web/v1/oee/daily-time-inputs/capacity-reasons/edit', {reason})
}

let update = async (req, res) => {
  let {title} = req.body;
  let reason = await new CapacityReason({id: req.params.id}).fetch()

  reason.save({title}, {patch: true})

  req.flash('success', `Successfully updated reason`)
  res.redirect('/oee/daily-time-inputs/capacity-reasons')
}

let save = async (req, res) => {
  let {title} = req.body;

  await new CapacityReason({title}).save()

  req.flash('success', `Successfully created new reason`)
  res.redirect('/oee/daily-time-inputs/capacity-reasons')
}


let destroy = async (req, res) => {
  let reason = await new CapacityReason({id: req.params.id}).fetch();

  if (!reason) {
      req.flash('danger', 'Unable to find the reason')
      return res.redirect(
        '/oee/daily-time-inputs/capacity-reasons',
      )
  }

  await reason.save({deleted_at: moment()}, {patch: true})

  req.flash('success', `Successfully deleted reason with ID ${reason.id}`)
  res.redirect('/oee/daily-time-inputs/capacity-reasons')
}


module.exports = {
  index,
  add,
  edit,
  update,
  save,
  destroy
}
