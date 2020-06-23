const rootPath = './../../../../../..'
const {
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`);
const GwoSparePart = require(`${rootPath}/app/models/Gwo/GwoSparePart`);

let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req);

  let gwoSpareParts = await new GwoSparePart()
    .query(function(qb) {
      qb.offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'ASC')
    .fetchAll();

  gwoSpareParts = gwoSpareParts.toJSON();

  res.render('web/v1/gwo/settings/spare-parts/index', {gwoSpareParts, ...paginationAttribute})
}

let add = async (req, res) => {
  res.render('web/v1/gwo/settings/spare-parts/add')
}

let edit = async (req, res) => {
  let gwoSparePart = await new GwoSparePart({id: req.params.id}).fetch()

  gwoSparePart = gwoSparePart.toJSON()

  res.render('web/v1/gwo/settings/spare-parts/edit', {gwoSparePart})
}

let update = async (req, res) => {
  let {name, quantity} = req.body;
  let gwoSparePart = await new GwoSparePart({id: req.params.id}).fetch()

  gwoSparePart.save({name, quantity}, {patch: true})

  res.redirect('/gwo/settings/spare-parts')
}

let save = async (req, res) => {
  let {name, quantity} = req.body;

  await new GwoSparePart({name, quantity}).save()

  res.redirect('/gwo/settings/spare-parts')
}

let show = async (req, res) => {
  let gwoSparePart = await new GwoSparePart({id: req.params.id}).fetch();

  gwoSparePart = gwoSparePart.toJSON();

  res.render('web/v1/gwo/settings/spare-parts/show', {gwoSparePart})
}

module.exports = {
  index,
  add,
  edit,
  update,
  save,
  show
}
