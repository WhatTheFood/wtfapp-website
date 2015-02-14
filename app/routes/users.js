var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var userController = require('../controllers/user');

/* users */
router.route('/')
  .get(authController.isAuthenticated, userController.getUsers)
  .post(userController.postUser);

/* user */
router.route('/:id')
  .get(authController.isAuthenticated, userController.getUser)
  .put(authController.isAuthenticated, userController.putUser)
  .delete(authController.isAuthenticated, userController.deleteUser);

module.exports = router;
