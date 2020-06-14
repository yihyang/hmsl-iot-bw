function apiAuthentication(req, res, next) {
  console.log('Api Authentication');
}

function webAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    // access user object in view
    res.locals.currentUser = req.user;
    res.locals.signedIn = true;

    next();
  } else {
    res.redirect('/sign-in' + '?redirect=' + req.originalUrl);
  }
}


module.exports = {
  apiAuthentication,
  webAuthentication
}
