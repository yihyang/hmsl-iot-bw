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

let add = async function(req, res) {
  res.render('web/v1/settings/users/add', {user: {}})
}

let save = async function(req, res) {
  let {name, employee_id, password, username, is_admin} = req.body;

  let user = {
    name,
    employee_id,
    password,
    username,
    is_admin,
  }

  let existingUser = await new User().query((qb) => {
    qb.where('username', username)
  }).fetch({require: false})

  if (existingUser) {
    return res.render('web/v1/settings/users/add', {user, messages: { 'error': ['User with the same username exists'] } })
  }

  await new User({name, employee_id, password, username, is_admin}).save()

  res.redirect('/settings/users')
}

let update = async function(req, res) {
  let {name, employee_id, password, is_admin} = req.body;
  let user = await new User({id: req.params.id}).fetch()

  let updates = {name, employee_id, is_admin: !!is_admin};

  user.save(updates, {patch: true})
  if (password != '') {
    user = await new User({id: req.params.id}).fetch()
    console.log(password)
    user.set('password', password)
    user.save()
  }

  res.redirect('/settings/users')
}

module.exports = {
  index,
  add,
  save,
  edit,
  update,
}
