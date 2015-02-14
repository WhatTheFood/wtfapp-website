var express = require('express');
var router = express.Router();

require('../models/restaurant')

/* get restaurants */
exports.getRestaurants = function (req, res){
  return RestaurantModel.find(function (err, objects) {
    if (!err) {
      return res.send(objects);
    } else {
      return console.log(err);
    }
  });
}

exports.getRestaurant = function (req, res){
  return RestaurantModel.findById(req.params.id, function (err, user) {
    if (!err) {
      return res.send(user);
    } else {
      return console.log(err);
    }
  });
}
