'use strict';

var express = require('express');
var passport = require('passport');

var auth = require('../auth.service');
var fbhandler = require('./handler');
var config = require('../../config/environment');

var User = require('../../api/user/user.model');
var UserTool = require('../../api/user/user.tools');

var router = express.Router();
var util = require("util");

var scope = config.fb.scope;
router
  .post('/', passport.authenticate('facebook'))

  .put('/', function facebookLogin(req, res) {
  var fb_token = req.body.token;
  var email = req.body.email;
  if (!fb_token || !email) {
    return res.status(400).send({"error": "Invalid request"});
  }

  User.findOne({'email': email}, function(err, user) {
    console.log("raw ::" +util.inspect(req.body, {showHidden: false, depth: null}));

    if (user) {
      console.log("TOK::" + fb_token + "  EMAIL::" + email);
      console.log("set facebook token");
      user.set({
        'fb': {
          'access_token': fb_token
        }
      }).save();

      if (!user.token) {
        console.log("create user token");
        user = UserTool.createUserToken(user);
      }
    } else {
      user = new User({
        'email': email,
        'password': "?$#T#I(@(IWQI()!)",
        'fb': {
          'access_token':fb_token
        }
      });
      user = UserTool.createUserToken(user);
    }

    user.save(function(err) {
      console.log("Go to update user infos");
      UserTool.updateUserInfosWithFacebook(user, function(result, data) {
        if (result === true) {
          return res.status(200).send({'user_token': data.token, 'user_id': data.id});
        } else {
          console.log(user.fb.access_token);
          return res.status(400).send(data);
        }
      });

    });
  });
})

  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/signup',
    session: false
  }), auth.setTokenCookie);

module.exports = router;
