const rootPath = '..';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require(`${rootPath}/app/models/Account/User`);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    console.log('test')
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
