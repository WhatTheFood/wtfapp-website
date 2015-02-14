var express = require('express');
var router = express.Router();
var userController = require('../controllers/user');

/* GET users listing. */
router.route('/')
  .get(userController.getUsers)
  .post(userController.postUser);

router.route('/:id')
  .get(userController.getUser)
  .put(userController.putUser)
  .delete(userController.deleteUser);

module.exports = router;
