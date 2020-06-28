const rootPath = './../../../../../../..'
const {
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`);
const GwoSparePartStock = require(`${rootPath}/app/models/Gwo/GwoSparePartStock`);
const GwoSparePart = require(`${rootPath}/app/models/Gwo/GwoSparePart`);


let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req);

  let {sparePartId} = req.params;

  let gwoSparePart = await new GwoSparePart({id: sparePartId}).fetch({require: false})
  gwoSparePart = gwoSparePart.toJSON()

  let gwoSparePartStocks = await new GwoSparePartStock()
    .query(function(qb) {
        qb.offset(paginationAttribute.page_offset)
          .limit(paginationAttribute.items_per_page)
      })
      .orderBy('id', 'DESC')
      .fetchAll({withRelated: ['user']});

  gwoSparePartStocks = gwoSparePartStocks.toJSON();


  res.render('web/v1/gwo/settings/spare-parts/stocks/index', { gwoSparePart, gwoSparePartStocks, ...paginationAttribute })
}

let add = async function(req, res) {
  let {sparePartId} = req.params;

  let gwoSparePart = await new GwoSparePart({id: sparePartId}).fetch({require: false})

  res.render('web/v1/gwo/settings/spare-parts/stocks/add', {gwoSparePart});
}

let save = async function(req, res) {
  let user = req.user;
  let userId = null;
  if (user) {
    userId = user.id;
  }

  let {sparePartId} = req.params;

  let {quantity} = req.body;

  await new GwoSparePartStock({quantity, user_id: userId, gwo_spare_part_id: sparePartId}).save()

  res.redirect(`/gwo/settings/spare-parts/${sparePartId}/stocks`)
}

module.exports = {
  index,
  add,
  save
}
