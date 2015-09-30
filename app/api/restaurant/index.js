'use strict';

var express = require('express');
var router = express.Router();

var restaurantController = require('./restaurant.controller');
var restaurantAdminController = require('./restaurant.admin.controller');

var auth = require('../../auth/auth.service');

// -- admin routes
router.get('/admin/', auth.hasRole('admin'), restaurantAdminController.getRestaurantsForAdmin);
router.post('/admin/enable', auth.hasRole('admin'), restaurantAdminController.postEnableRestaurant);
router.post('/admin/disable', auth.hasRole('admin'), restaurantAdminController.postDisableRestaurant);
router.get('/refresh', auth.hasRole('admin'), restaurantAdminController.refreshAll);

// -- normal routes

router.get('/', restaurantController.getRestaurants);

router.get('/:id', restaurantController.getRestaurantFeedback);

// TODO:
//router.get('/:id/Feedback', auth.isAuthenticated(), restaurantController.getRestaurantFeedback);

router.post('/:id/queue/votes', auth.isAuthenticated(), restaurantController.voteOnRestaurantQueue);

router.post('/:id/feedback', auth.isAuthenticated(), restaurantController.addFeedback);

module.exports = router;