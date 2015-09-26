'use strict';

var express = require('express');
var passport = require('passport');

var auth = require('../auth.service');
var config = require('../../config/environment');

var router = express.Router();

var scope = config.fb.scope;
router
  .post('/', passport.authenticate('facebook'))

  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/signup',
    session: false
  }), auth.setTokenCookie);

module.exports = router;