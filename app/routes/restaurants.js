var express = require('express');
var router = express.Router();
var restaurantController = require('../controllers/restaurant');

/* users */
router.route('/')
  .get(restaurantController.getRestaurants);

/* user */
router.route('/:id')
  .get(restaurantController.getRestaurant);

module.exports = router;
