var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = function (User, config) {

  passport.use('facebook', new FacebookStrategy({
      clientID        : config.fb.id,
      clientSecret    : config.fb.secret,
      callbackURL     : config.fb.callbackUrl
    },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

      //console.log('------------------------------------------------');
      //console.log(access_token, refresh_token, profile, done);
      //console.log('------------------------------------------------');

      // asynchronous
      process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({ 'id' : profile.id }, function(err, user) {

          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err)
            return done(err);

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          }
          else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();

            // set all of the facebook information in our user model
            newUser.fb.id    = profile.id; // set the users facebook id
            newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user
            newUser.first_name  = profile.name.givenName;
            newUser.last_name = profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          }
        });
      });
    }));

};