// Load required packages
var passport = require('passport');
var jwt = require('jsonwebtoken');
var secret = require('../config/secret')
var BasicStrategy = require('passport-http').BasicStrategy;
var TokenStrategy =  require('passport-token').Strategy;
var UserTool = require('../tools/user.js');

var UserModel = require('../models/user');

exports.login = function(req, res) {
    return res.send(req.user.token)
}

exports.facebookLogin = function(req, res) {
    fb_token = req.body.token;
    email = req.body.email
    if (!fb_token || !email) {
        return res.status(400).send({"error": "Invalid request"})
    }
    UserModel.findOne({'email': email}, function(err, user) {
        if (user) {
            user.update({ "facebook_token" : fb_token}, function(err) {
                if (err) {
                    return res.status(503).send(err);
                }
            });
            if (!user.token) {
                user = createUserToken(user);
            }
        }
        else {
            if (!user) {
                user = new UserModel({
                    'email': email,
                    'password': "?$#T#I(@(IWQI()!)",
                    'facebook_token': fb_token
                })
                user.save(function(err) {
                    if (err) {
                        return res.status(400).send(err)
                    }
                });
                user = createUserToken(user);
            }
        }
        user = UserTool.updateUserInfosWithFacebook(user);
        return res.status(200).send(user.token);
    });
}

passport.use(new BasicStrategy(
  function(email, password, callback) {
    UserModel.getAuthenticated(email, password, function(err, user, reason, email) {

          // login was successful if we have a user
          if (user) {
              // handle login success
              console.log('login success');
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

createUserToken = function(user) {
    var token = jwt.sign(user, secret.secretToken, { expiresInMinutes: 600 });
    user.set({ token : token})
    return user
}

exports.isAuthenticated = passport.authenticate('basic', { session : false });
