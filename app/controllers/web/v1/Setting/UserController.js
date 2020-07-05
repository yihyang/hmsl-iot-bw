const rootPath = './../../../../..';
const User = require(`${rootPath}/app/models/Account/User`);
const {
  getPaginationAttributes,
} = require(`${rootPath}/app/helpers/route`);

let index = async function(req, res) {
  let paginationAttribute = getPaginationAttributes(req)

  let usersCount = await new User().count('*');
  let total_page = Math.ceil(parseInt(usersCount) / paginationAttribute.items_per_page);

  let users = await new User()
    .query(function(qb) {
      qb.offset(paginationAttribute.page_offset)
        .limit(paginationAttribute.items_per_page)
    })
    .orderBy('id', 'ASC')
    .fetchAll()

  users = users.toJSON()

  res.render('web/v1/settings/users/index', { users, ...paginationAttribute, total_page})
}

let edit = async function(req, res) {

  let user = await new User({id: req.params.id}).fetch()

  user = user.toJSON()

  res.render('web/v1/settings/users/edit', {user})
}

let update = async function(req, res) {
  let {name, employee_id} = req.body;
  let user = await new User({id: req.params.id}).fetch()

  user.save({name, employee_id}, {patch: true})

  res.redirect('/settings/users')
}

module.exports = {
  index,
  edit,
  update
}
