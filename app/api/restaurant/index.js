'use strict';

var express = require('express');
var router = express.Router();

var restaurantController = require('./restaurant.controller');
var auth = require('../../auth/auth.service');

/****************************** GET ********************************/

/* restaurants */
router.route('/')
  .get(restaurantController.getRestaurants);

/* refresh admin command */
router.route('/refresh')
  .get(auth.isAuthenticated(), restaurantController.refreshAll);

/* restaurant */
router.route('/:id')
    .get(restaurantController.getRestaurantWOFeedback);

router.route('/:id/feedback')
    .get(auth.isAuthenticated(), restaurantController.getRestaurantWFeedback);

/****************************** POST *******************************/

router.route('/:id/queue/votes')
    .post(auth.isAuthenticated(), restaurantController.voteOnRestaurantQueue);

/****************************** PUT ********************************/

router.route('/:id/menu')
    .put(auth.isAuthenticated(), restaurantController.updateRestaurantMenu);

module.exports = router;
