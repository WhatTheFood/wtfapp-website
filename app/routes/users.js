var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var userController = require('../controllers/user');

var secret = require('../config/secret')
var tokenManager = require('../config/token_manager');

var jwt = require('express-jwt')

/* users */
router.route('/login')
  .get(authController.isAuthenticated, authController.login)

router.route('/login/facebook')
  .put(authController.facebookLogin)

router.route('/')
  .get(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.getUsers)
  .post(userController.postUser);

router.route('/me')
  .get(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.getCurrentUser);

router.route('/me/friends')
  .get(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.getCurrentUserFriends);

router.route('/me/friends/restaurant')
    .get(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.getFriendsAtRestaurant);

router.route('/me/restaurant/')
  .post(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.addUserDestination);


/* user */
router.route('/:id', jwt({secret: secret.secretToken}))
  .get(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.getUser)
  .put(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.putUser)
  .delete(jwt({secret: secret.secretToken}), tokenManager.verifyToken, userController.deleteUser);

module.exports = router;
