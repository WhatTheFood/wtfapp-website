'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var Response = require('../../services/response.js');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;

    if (error) {
      return Response.error(res, Response.UNAUTHORIZED, error);
    }
    if (!user)  {
      return Response.error(res, Response.AUTHORIZATION_ERROR);
    }

    var token = auth.signToken(user._id, user.role);
    Response.success(res, Response.HTTP_OK, {token: token});
  })(req, res, next)
});

router.post('/apikey', function(req, res, next) {

  console.log(req.body);
  console.log(req.query);

  passport.authenticate('localapikey', function (err, user, info) {
    var error = err || info;

    if (error) {
      return Response.error(res, Response.UNAUTHORIZED, error);
    }
    if (!user) {
      return Response.error(res, Response.AUTHORIZATION_ERROR);
    }

    var apikey = user.apikey;
    Response.success(res, Response.HTTP_OK, {key: apikey});
  })(req, res, next)
});

module.exports = router;
