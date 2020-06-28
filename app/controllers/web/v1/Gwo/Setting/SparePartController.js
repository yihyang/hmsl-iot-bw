const rootPath = './../../../../../..'
const {
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`);
const GwoSparePart = require(`${rootPath}/app/models/Gwo/GwoSparePart`);
const stocks = require('./SparePart/StockController');

let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req);

  let gwoSpareParts = await new GwoSparePart()
    .query(function(qb) {
      qb.offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'ASC')
    .fetchAll({withRelated: ['user']});

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
  let {sp, spc, item, area, minimum_quantity} = req.body;
  let gwoSparePart = await new GwoSparePart({id: req.params.id}).fetch()

  gwoSparePart.save({sp, spc, item, area, minimum_quantity}, {patch: true})

  res.redirect('/gwo/settings/spare-parts')
}

let save = async (req, res) => {
  let user = req.user;
  let userId = null;
  if (user) {
    userId = user.id;
  }
  let {sp, spc, item, area, minimum_quantity} = req.body;

  await new GwoSparePart({sp, spc, item, area, minimum_quantity, user_id: userId}).save()

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
  show,
  stocks
}
