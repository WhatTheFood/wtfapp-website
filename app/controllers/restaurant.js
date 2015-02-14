var express = require('express');
var request = require('request');
var router = express.Router();

var RestaurantModel = require('../models/restaurant');

/* get restaurants */
exports.getRestaurants = function (req, res){
  return RestaurantModel.find(function (err, restaurants) {
    if (!err) {
      return res.send(restaurants);
    } else {
      return console.log(err);
    }
  });
}

exports.getRestaurant = function (req, res){
  return RestaurantModel.findOne({"id": req.params.id}, function (err, restaurant) {
    if (!err) {
      return res.send(restaurant);
    } else {
      return console.log(err);
    }
  });
}

/* update db with remote business data */
exports.refreshAll = function (req, res){

  /* get json file and parse it */
  request('http://thepbm.ovh.org/static/json/crous-poitiers.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body.replace(new RegExp('\r?\n','g'), ' '));

      /* update */
      data.restaurants.forEach(function(element, index) {
        RestaurantModel.findOne({"id": element.id}, function (err, restaurant){
          if(restaurant == null)
          {
            new RestaurantModel(element).save();
          } else {
            restaurant.set(element);
            restaurant.save();
          }
        });
      });
    }
  });

  return res.send({});

}
