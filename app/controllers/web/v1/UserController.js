const rootPath = '../../../..'
const User = require(`${rootPath}/app/models/Account/User`);
const passport = require('passport');

function add(req, res) {
  res.render('web/v1/users/add')
}

async function save(req, res) {
  const { username, password, name } = req.body;

  let user = await new User({username}).fetch({require: false});

  if (user) {
    res.render('web/v1/users/add');

    return;
  }

  let newUser = await new User({username, password, name}).save();

  res.redirect('/sign-in');
}

// function
function sign_in(req, res) {
  res.render('web/v1/users/sign_in')
}

function new_session(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/sign-in'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      let { redirect } = req.query;
      if (redirect) {
        res.redirect(redirect);
      } else {
        return res.redirect('/portal');
      }
    });
  })(req, res, next);
}

function sign_out(req, res) {
  req.logout();
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
}

module.exports = {
  add,
  save,
  sign_in,
  new_session,
  sign_out
}
