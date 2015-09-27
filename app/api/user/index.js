var express = require('express');
var router = express.Router();

var userController = require('./user.controller');
var userAdminController = require('./user.admin.controller');
var auth = require('../../auth/auth.service');

/* users */
router.route('/')
  .post(userController.postUser);

router.route('/toques')
  .get(auth.isAuthenticated(), userController.getToques);

router.route('/me')
  .get(auth.isAuthenticated(), userController.getCurrentUser)
  .put(auth.isAuthenticated(), userController.putCurrentUser);

router.route('/me/preferences')
  .put(auth.isAuthenticated(), userController.putCurrentUser);

router.route('/me/action')
  .post(auth.isAuthenticated(), userController.putCurrentUserPreferences);

router.route('/me/friends')
  .get(auth.isAuthenticated(), userController.getCurrentUserFriends);

router.route('/me/friends/restaurant')
  .put(auth.isAuthenticated(), userController.getFriendsAtRestaurant);

router.route('/me/restaurant/')
  .put(auth.isAuthenticated(), userController.addUserDestination);


/* user */
router.route('/:id')
  .get(auth.isAuthenticated(), userController.getUser)

// -- admin

router.route('/:id')
  .delete(auth.hasRole('admin'), userAdminController.deleteUser);

router.route('/')
  .get(auth.hasRole('admin'), userAdminController.getUsers);

router.route('/:id/role')
  .post(auth.hasRole('admin'), userAdminController.postRole);

router.route('/:id')
  .put(auth.isAuthenticated(), userAdminController.putUser);

module.exports = router;
