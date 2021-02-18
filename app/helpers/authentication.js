function apiAuthentication(req, res, next) {
  console.log('Api Authentication');
}

function webAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    // access user object in view
    res.locals.currentUser = req.user;
    res.locals.signedIn = true;

    // set isAdmin attributes
    if (req.user.attributes.is_admin) {
      res.locals.isAdmin = true
    }

    next();
  } else {
    res.redirect('/sign-in' + '?redirect=' + req.originalUrl);
  }
}

function checkIsAdmin(req, res, next) {
  if (!req.user.attributes.is_admin) {
    req.flash('error', 'You do not have access to the page')
    res.redirect('/')
    return;
  }

  next();
}


module.exports = {
  apiAuthentication,
  webAuthentication,
  checkIsAdmin,
}
