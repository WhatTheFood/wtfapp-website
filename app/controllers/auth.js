// Load required packages
var passport = require('passport');
var jwt = require('jsonwebtoken');
var secret = require('./secret')
var BasicStrategy = require('passport-http').BasicStrategy;

var UserModel = require('../models/user');

exports.login = function(req, res) {
    console.log("LOGIN")
    return res.send(req.user.token)
}

passport.use(new BasicStrategy(
  function(email, password, callback) {
    UserModel.getAuthenticated(email, password, function(err, user, reason, email) {

          // login was successful if we have a user
          if (user) {
              // handle login success
              console.log('login success');
              var token = jwt.sign(user, secret.secretToken, { expiresInMinutes: 600 });
              user.set({ token : token})
              console.log(user)
              return callback(null, user);
          }

          // otherwise we can determine why we failed
          var reasons = UserModel.failedLogin;
          switch (reason) {
              case reasons.NOT_FOUND:
              case reasons.PASSWORD_INCORRECT:
                  // note: these cases are usually treated the same - don't tell
                  // the user *why* the login failed, only that it did
                  console.log("Mauvais identifiant.");
                  return callback(null, false);
                  break;
              case reasons.MAX_ATTEMPTS:
                  // send email or otherwise notify user that account is
                  // temporarily locked
                  console.log("Trop de tentatives !");
                  return callback(null, false);
                  break;
          }
      });
  }
));

exports.isAuthenticated = passport.authenticate('basic', { session : false });
