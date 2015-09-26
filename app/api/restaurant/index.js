'use strict';

var express = require('express');
var router = express.Router();

var restaurantController = require('./restaurant.controller');
var auth = require('../../auth/auth.service');

/* refresh admin command */
router.get('/refresh', auth.isAuthenticated(), restaurantController.refreshAll);

router.get('/', restaurantController.getRestaurants);
router.get('/:id', restaurantController.getRestaurantWOFeedback);
router.get('/:id/feedback', auth.isAuthenticated(), restaurantController.getRestaurantWFeedback);
router.post('/:id/queue/votes', auth.isAuthenticated(), restaurantController.voteOnRestaurantQueue);
router.put('/:id/menu', auth.isAuthenticated(), restaurantController.updateRestaurantMenu);

module.exports = router;