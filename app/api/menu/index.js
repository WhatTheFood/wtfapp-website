var express = require('express');
var router = express.Router();

var menuController = require('./menu.controller');
var auth = require('../../auth/auth.service');

var Response = require('../../services/response.js');



router.post('/:id/feedback', auth.isAuthenticated(), menuController.addFeedback);


module.exports = router;
