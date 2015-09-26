var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

exports.setup = function (User, config) {

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, user);
      });
    }
  ));

  passport.use(new LocalAPIKeyStrategy(
    function(apikey, done) {

      User.findOne({ apikey: apikey }, function (err, user) {
        if (err) {
          console.log(err);
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Invalid api key' });
        }
        return done(null, user);
      });
    }
  ));

};
