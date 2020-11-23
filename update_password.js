const User = require('./app/models/Account/User');


async function runJob()
{
  let user = await new User({id: 1}).fetch()

  user.set('password', '1234');
  user.save();
  // user.save({password: 'aaaaaab'}, {patch: true})
  // let users = await new User()
  //   .query(function(query) {
  //     query.where('id', 'IN', [1])
  //   })
  //   .fetchAll();

  // for (var i = users.length - 1; i >= 0; i--) {
  //   let user = users[i];
  //   console.log(users);
  //   user.update({password: 'aaaaaa'}, {patch: true})
  // }
}

runJob();
