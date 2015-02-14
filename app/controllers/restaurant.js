var express = require('express');
var router = express.Router();

var RestaurantModel = require('../models/restaurant');

/* get restaurants */
exports.getRestaurants = function (req, res){
  return RestaurantModel.find(function (err, restaurants) {
    if (!err) {
      return res.send(restaurants);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
}

exports.getRestaurant = function (req, res){
  return RestaurantModel.findOne({"id": req.params.id}, function (err, restaurant) {
    if (!err) {
      return res.send(restaurant);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
}
