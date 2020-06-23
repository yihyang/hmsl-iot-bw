const rootPath = './../../../../../..'
const {
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`);
const GwoReason = require(`${rootPath}/app/models/Gwo/GwoReason`);

let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req);

  let gwoReasons = await new GwoReason()
    .query(function(qb) {
      qb.offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'ASC')
    .fetchAll();

  gwoReasons = gwoReasons.toJSON();

  res.render('web/v1/gwo/settings/reasons/index', {gwoReasons, ...paginationAttribute})
}


let add = async (req, res) => {
  res.render('web/v1/gwo/settings/reasons/add')
}

let edit = async (req, res) => {
  let reason = await new GwoReason({id: req.params.id}).fetch()

  reason = reason.toJSON()

  res.render('web/v1/gwo/settings/reasons/edit', {reason})
}

let update = async (req, res) => {
  let {name} = req.body;
  let reason = await new GwoReason({id: req.params.id}).fetch()

  reason.save({name}, {patch: true})

  res.redirect('/gwo/settings/reasons')
}

let save = async (req, res) => {
  let {name} = req.body;

  await new GwoReason({name}).save()

  res.redirect('/gwo/settings/reasons')
}

let show = async (req, res) => {
  let gwoReason = await new GwoReason({id: req.params.id}).fetch();

  gwoReason = gwoReason.toJSON();

  res.render('web/v1/gwo/settings/reasons/show', {gwoReason})
}

module.exports = {
  index,
  add,
  edit,
  update,
  save,
  show
}
