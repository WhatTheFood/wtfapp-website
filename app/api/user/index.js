var express = require('express');
var router = express.Router();

var userController = require('./user.controller');
var auth = require('../../auth/auth.service');

/* users */
router.route('/')
  .get(auth.hasRole('admin'), userController.getUsers)
  .post(userController.postUser);

router.route('/toques')
  .get(auth.isAuthenticated(), userController.getToques);

router.route('/me')
  .get(auth.isAuthenticated(), userController.getCurrentUserInfos);

router.route('/me/friends')
  .get(auth.isAuthenticated(), userController.getCurrentUserFriends);

router.route('/me/friends/restaurant')
  .put(auth.isAuthenticated(), userController.getFriendsAtRestaurant);

router.route('/me/restaurant/')
  .put(auth.isAuthenticated(), userController.addUserDestination);


/* user */
router.route('/:id')
  .get(auth.isAuthenticated(), userController.getUser)
  .put(auth.isAuthenticated(), userController.putUser)
  .delete(auth.hasRole('admin'), userController.deleteUser);

module.exports = router;
