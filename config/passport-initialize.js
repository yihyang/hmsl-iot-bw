const rootPath = '..';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
const User = require(`${rootPath}/app/models/Account/User`);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.where('username', username)
      .fetch({
        require: false
      })
      .then(user => {
        if (!user) {
          return done(null, false, {
            message: 'Incorrect email.'
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, {
            message: 'Incorrect password.'
          });
        }
        return done(null, user);
      })
      .catch(err => {
        return done(err);
      })
  }
));

/**
 * Find the Operator and authorize
 */
passport.use('userHttpBearer', new BearerStrategy(
  async function(token, done) {

    let user = await User.where({access_token: token}).fetch({require: false});

    if(!user) {
      return done(null, false);
    }

    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.where('id', id)
    .fetch()
    .then(user => {
      return done(null, user);
    })
    .catch(err => {
      return done(err);
    })
});

module.exports = passport;
