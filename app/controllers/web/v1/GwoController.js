const rootPath = './../../../..'
const settings = require('./Gwo/SettingController')
const {
  filterParams,
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`)
const {
  asyncForEach
} = require(`${rootPath}/app/helpers/loop`)
const {
  mapOptionsForSelect2,
} = require(`${rootPath}/app/helpers/option-mapper`)
const Gwo = require(`${rootPath}/app/models/Gwo/Gwo`)
const GwoItem = require(`${rootPath}/app/models/Gwo/GwoItem`)
const GwoItemSparePartUsage = require(`${rootPath}/app/models/Gwo/GwoItemSparePartUsage`)
const GwoSparePart = require(`${rootPath}/app/models/Gwo/GwoSparePart`)
const GwoReason = require(`${rootPath}/app/models/Gwo/GwoReason`)
const Node = require(`${rootPath}/app/models/Node/Node`)
const moment = require('moment')
const _ = require('lodash')

let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req);

  let gwos = await new Gwo()
    .query(function(qb) {
      qb.offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'DESC')
    .fetchAll({withRelated: ['reason', 'user', 'gwo_items.node']});

  gwos = gwos.toJSON();

  res.render('web/v1/gwo/index', {gwos, ...paginationAttribute})
}

let add = async (req, res) => {
  let nodes = await Node
    .query((query) => {
      query.orderBy('name', 'ASC')
    })
    .fetchAll();
  nodes = nodes.toJSON();
  nodes = mapOptionsForSelect2(nodes, 'id', 'name');

  let spareParts = await GwoSparePart
    .query((query) => {
      query.orderBy('item', 'ASC')
    })
    .fetchAll();
  spareParts = spareParts.toJSON();
  spareParts = mapOptionsForSelect2(spareParts, 'id', 'item');

  let reasons = await getGwoReasons()


  res.render('web/v1/gwo/add', { nodes, spareParts, reasons })
}

let save = async (req, res) => {
  let user = req.user;
  let userId = null;
  if (user) {
    userId = user.id;
  }

  let gwoParams = filterParams(req.body, ['start_time', 'end_time', 'type', 'area', 'gwo_reason_id']);
  // create GWO
  let gwo = await new Gwo({...gwoParams, user_id: userId}).save();

  // create GWO Item
  asyncForEach(req.body.gwo_items, async function(item) {
    let gwoItemParams = filterParams(item, ['node_id', 'notes']);
    let gwoItem = await new GwoItem({ ...gwoItemParams,
      gwo_id: gwo.id
    }).save();

    // save each spare part
    asyncForEach(item.spare_parts, async function(sparePart) {
      let sparePartParams = filterParams(sparePart, ['spare_part_quantity', 'gwo_spare_part_id']);

      let gwoItemSparePart = await new GwoItemSparePartUsage({ ...sparePartParams,
        gwo_item_id: gwoItem.id
      }).save();
    });

    // update events
    // await new Event().query((qb) => {
    //   qb.where('end_time', '>=', gwoParams.start_time)
    //     .where('start_time', '<=', gwoParams.end_time)
    // }).save({
    //   gwo_item_id: gwoItem.id,
    // }, {
    //   patch: true
    // });
  });

  res.redirect('/gwo');
}

var show = async function(req, res) {
  let { id } = req.params;

  let gwo = await new Gwo({id})
    .fetch({withRelated: ['gwo_items.node', 'gwo_items.spare_part_usages.spare_part']});
  gwo = gwo.toJSON();

  res.render('web/v1/gwo/show', {gwo});
}

let edit = async (req, res) => {
  let { id } = req.params;

  let gwo = await new Gwo({id})
    .fetch({withRelated: ['gwo_items.node', 'gwo_items.spare_part_usages.spare_part']});
  gwo = gwo.toJSON();
  gwo = offsetObjectTimezone(gwo, ['start_time', 'end_time'])
  // console.log(gwo)


  let reasons = await getGwoReasons()

  res.render('web/v1/gwo/edit', {gwo, reasons});
}

let update = async (req, res) => {
  console.log(req.body)
  let updates = _.pick(req.body, ['type', 'start_time', 'end_time', 'gwo_reason_id'])

  let { id } = req.params;

  let gwo = await (new Gwo({id})).fetch()

  if (!gwo) {
    req.flash('error', `Unable to find GWO`)
    res.redirect('/gwo')
  }
  console.log(gwo)
  console.log(updates)

  await gwo.save(updates, {patch: true})

  req.flash('success', `Successfully updated GWO`)
  res.redirect('/gwo')
}

let getGwoReasons = async () => {
  let reasons = await GwoReason
    .query((query) => {
      query.orderBy('name', 'ASC')
    })
    .fetchAll();
  return reasons.toJSON();
}

let offsetObjectTimezone = (object, keys) => {
  for (var i = keys.length - 1; i >= 0; i--) {
    let key = keys[i]
    let item = object[key]
    if (item) {
      object[key] = moment(item).format('YYYY-MM-DD hh:mm:ss A')
    }
  }

  return object
}

module.exports = {
  settings,
  index,
  add,
  save,
  show,
  edit,
  update
}
