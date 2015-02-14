var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var restaurantController = require('../controllers/restaurant');

/* users */
router.route('/')
  .get(authController.isAuthenticated, restaurantController.getRestaurants);

/* user */
router.route('/:id')
  .get(authController.isAuthenticated, restaurantController.getRestaurant);

module.exports = router;
