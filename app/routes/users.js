var express = require('express');
var router = express.Router();


require('../models/user')

/* GET users listing. */
router.get('/', function (req, res){
  return UserModel.find(function (err, users) {
    if (!err) {
      return res.send(users);
    } else {
      return console.log(err);
    }
  });
});

router.post('/', function (req, res){
  var user;
  console.log("POST: ");
  console.log(req.body);
  user = new UserModel({
    email: req.body.email,
    password: req.body.password,
  });
  user.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });
  return res.send(user);
});

router.get('/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    if (!err) {
      return res.send(user);
    } else {
      return console.log(err);
    }
  });
});

router.put('/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    user.email = req.body.email;
    user.password = req.body.password;
    return user.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.send(user);
    });
  });
});

router.delete('/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});

module.exports = router;
