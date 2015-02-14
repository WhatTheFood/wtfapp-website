var express = require('express');
var router = express.Router();

var tokenManager = require('../config/token_manager');
var UserModel = require('../models/user');

/* GET users listing. */
exports.getUsers = function(req, res) {
  return UserModel.find(function (err, users) {
    if (!err) {
      return res.send(users);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
}

/*
** TODO: always return 503 but it's the good token
*/
exports.getCurrentUser = function(req, res) {
    var token = tokenManager.getToken(req.headers);

    UserModel.findOne({token: token }, function (err, user) {
        console.log(user);
        if (err) {
            return res.status(503).send(err)
        }
        else if (!user) {
            return res.status(503).send({ 'message': 'An error occured' });
        }
        else {
            console.log(user)
            return res.status(200).send(user)
        }
    });
}

/* POST user listing. */
exports.postUser = function (req, res){
  var user;
  console.log("POST: ");
  console.log(req.body);
  user = new UserModel({
    email: req.body.email,
    password: req.body.password,
  });
  user.save(function (err) {
    if (!err) {
      console.log("created");
      return res.send(user);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
}

/* GET user. with id */
exports.getUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    if (!err) {
      return res.send(user);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
}

/* PUT user. with id */
exports.putUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {

    if (req.body.password.length > 30) {
        return res.status(400).send({ 'password': 'must be at least 5 characters and at most 30.'})
    }
    user.email = req.body.email;
    user.password = req.body.password;
    return user.save(function (err) {
      if (!err) {
        console.log("updated");
        return res.send(user);
      } else {
        console.log(err);
        return res.status(400).send(err);
      }
    });
  });
}

/* DEL user.with id */
exports.deleteUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
        return res.status(400).send(err);
      }
    });
  });
}
