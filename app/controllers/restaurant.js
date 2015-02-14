var express = require('express');
var router = express.Router();

var RestaurantModel = require('../models/restaurant');

/* get restaurants */
exports.getRestaurants = function (req, res){
  return RestaurantModel.find(function (err, restaurant) {
    if (!err) {
      return res.send(restaurant);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
};

exports.getRestaurant = function (req, res) {
    if (req.query.lat && req.query.lng) {
        // todo : geospatial querying
    } else {
        return RestaurantModel.findOne({"id": req.params.id}, function (err, restaurant) {
            console.log(req.query);
            if (!err) {
                return res.send(restaurant);
            } else {
              console.log(err);
              return res.status(400).send(err);
            }
        });
    }
};
