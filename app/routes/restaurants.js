var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var restaurantController = require('../controllers/restaurant');

/****************************** GET ********************************/

/* restaurants */
router.route('/')
  .get(restaurantController.getRestaurants);

/* refresh admin command */
router.route('/refresh')
  .get(restaurantController.refreshAll);

/* restaurant */
router.route('/:id')
    .get(restaurantController.getRestaurant);


/****************************** PUT ********************************/

router.route('/:id/queue')
    .put(restaurantController.updateRestaurantQueue);
router.route('/:id/menu')
    .put(restaurantController.updateRestaurantMenu);

module.exports = router;
