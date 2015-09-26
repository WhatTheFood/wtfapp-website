'use strict';

var express = require('express');
var router = express.Router();

var restaurantController = require('./restaurant.controller');
var auth = require('../../auth/auth.service');

/* refresh admin command */
router.get('/refresh', auth.hasRole('admin'), restaurantController.refreshAll);

router.get('/', restaurantController.getRestaurants);
router.get('/:id', restaurantController.getRestaurantFeedback);

//router.get('/:id/feedback', auth.isAuthenticated(), restaurantController.getRestaurantFeedback);

router.post('/:id/queue/votes', auth.isAuthenticated(), restaurantController.voteOnRestaurantQueue);

router.put('/:id/menu', auth.hasRole('admin'), restaurantController.addFeedback);

module.exports = router;