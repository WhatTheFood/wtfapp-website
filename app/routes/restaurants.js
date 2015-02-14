var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var restaurantController = require('../controllers/restaurant');

/* restaurants */
router.route('/')
  .get(restaurantController.getRestaurants);

/* refresh admin command */
router.route('/refresh')
  .get(restaurantController.refreshAll);

/* restaurant */
router.route('/:id')
  .get(restaurantController.getRestaurant);


module.exports = router;
