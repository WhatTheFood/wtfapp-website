var express = require('express');
var router = express.Router();

var statsController = require('./stats.controller');
var auth = require('../../auth/auth.service');

var Response = require('../../services/response.js');



router.route('/me')
  .get(auth.isAuthenticated(), statsController.getStats);

router.route('/all')
  .get(statsController.getStats);

module.exports = router;
