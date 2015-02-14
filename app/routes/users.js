var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');
var userController = require('../controllers/user');

var secret = require('../controllers/secret')
var jwt = require('express-jwt')

/* users */
router.route('/login')
  .get(authController.isAuthenticated, authController.login)

router.route('/')
  .get(authController.isAuthenticated, userController.getUsers)
  .post(userController.postUser);

/* user */
router.route('/:id', jwt({secret: secret.secretToken}))
  .get(authController.isAuthenticated, userController.getUser)
  .put(authController.isAuthenticated, userController.putUser)
  .delete(authController.isAuthenticated, userController.deleteUser);

module.exports = router;
