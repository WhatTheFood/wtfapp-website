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
    .get(restaurantController.getRestaurantWOFeedback);
router.route('/:id/feedback')
    .get(restaurantController.getRestaurantWFeedback);

/****************************** POST *******************************/

router.route('/:id/queue/votes')
    .post(restaurantController.voteOnRestaurantQueue);

/****************************** PUT ********************************/

router.route('/:id/menu')
    .put(restaurantController.updateRestaurantMenu);

module.exports = router;
