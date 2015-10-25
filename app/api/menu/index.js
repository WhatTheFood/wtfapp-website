var express = require('express');
var router = express.Router();

var menuController = require('./menu.controller');
var auth = require('../../auth/auth.service');

var Response = require('../../services/response.js');



router.put('/:id/feedback', auth.isAuthenticated(), menuController.addFeedback);

router.get('/restaurant/:idRestaurant', auth.isAuthenticated(), menuController.getMenusForRestaurant);

router.get('/list', auth.isAuthenticated(), menuController.getMenus);

module.exports = router;
