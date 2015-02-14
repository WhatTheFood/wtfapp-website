var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var restaurantController = require('../controllers/restaurant');

/* restaurants */
router.route('/')
  .get(authController.isAuthenticated, restaurantController.getRestaurants);

/* restaurant */
router.route('/:id')
  .get(authController.isAuthenticated, restaurantController.getRestaurant);

module.exports = router;
