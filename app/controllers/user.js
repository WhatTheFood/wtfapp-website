var express = require('express');
var router = express.Router();

var UserModel = require('../models/user');

/* GET users listing. */
exports.getUsers = function (req, res){
  return UserModel.find(function (err, users) {
    if (!err) {
      return res.send(users);
    } else {
      console.log(err);
      return res.status(400).send(err);
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
