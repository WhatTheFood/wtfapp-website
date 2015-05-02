// Load required packages
var passport = require('passport');
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
var BasicStrategy = require('passport-http').BasicStrategy;
var TokenStrategy =  require('passport-token').Strategy;
var UserTool = require('../tools/user.js');

var UserModel = require('../models/user');

exports.login = function(req, res) {
  return res.send({'user_token': req.user.token, 'user_id': req.user.id});
};

exports.facebookLogin = function(req, res) {
  fb_token = req.body.token;
  email = req.body.email;
  if (!fb_token || !email) {
    return res.status(400).send({"error": "Invalid request"});
  }
  console.log(fb_token);

  UserModel.findOne({'email': email}, function(err, user) {
    if (user) {
      console.log("set facebook token");
      user.set({
        facebook_token : fb_token
      });

      if (!user.token) {
        console.log("create user token");
        user = createUserToken(user);
      }
    } else {
      user = new UserModel({
        'email': email,
        'password': "?$#T#I(@(IWQI()!)",
        'facebook_token': fb_token
      });
      user = createUserToken(user);
    }

    user.save(function(err) {
      console.log("Go to update user infos");
      console.log(user.facebook_token);
      UserTool.updateUserInfosWithFacebook(user, function(result, data) {
        if (result === true) {
          return res.status(200).send({'user_token': data.token, 'user_id': data.id});
        } else {
          console.log(user.facebook_token);
          return res.status(400).send(data);
        }
      });

    });
  });
};

passport.use(new BasicStrategy(
  function(email, password, callback) {
    UserModel.getAuthenticated(email, password, function(err, user, reason, email) {

      // login was successful if we have a user
      if (user) {
        // handle login success
        console.log('login success');
        user.token = null;
        user = createUserToken(user);
        user.update({ token: user.token}, function(err) {
          if (err) {
            console.log(err);
          }
        });
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

        case reasons.MAX_ATTEMPTS:
          // send email or otherwise notify user that account is
          // temporarily locked
          console.log("Trop de tentatives !");
          return callback(null, false);
      }
    });
  }
));

createUserToken = function (user) {
  var token = jwt.sign(user, secret.secretToken, { expiresInMinutes: 600 });
  user.set({'token': token});
  user.save();
  return user;
};

exports.isAuthenticated = passport.authenticate('basic', { session : false });
