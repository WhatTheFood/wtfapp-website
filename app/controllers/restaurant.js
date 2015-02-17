var express = require('express');
var request = require('request');
var router = express.Router();
var UserController = require('../controllers/user.js');

var RestaurantModel = require('../models/restaurant');

/****************************** GET ********************************/

/**
 * Get restaurant
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.getRestaurant = function (req, res) {
    return RestaurantModel.findOne({"id": req.params.id}, function (err, restaurant) {
        console.log(req.query);
        if (!err) {
            return res.send(restaurant);
        } else {
            console.log(err);
            return res.status(400).send(err);
        }
    });
};

/**
 * Get restaurants
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.getRestaurants = function (req, res) {
    if (req.query.lat && req.query.lng) { // geospatial querying
        var geoJsonTarget = {
            type: 'Point',
            coordinates: [Number(req.query.lng), Number(req.query.lat)]
        };
        var maxDistance = req.query.maxDistance ? Number(req.query.maxDistance) : 0.5;
        RestaurantModel.geoNear(geoJsonTarget, {spherical : true, maxDistance : maxDistance}, function (err, geoResults, stats) {
            var restaurants = [];
            for (var i = 0, length = geoResults.length; i < length; i++) {
                var geoResult = geoResults[i];
                var restaurant = geoResult.obj;
                restaurant.distance = geoResult.dis;
                restaurants.push(restaurant);
            }
            if (!err) {
                return res.send(restaurants);
            } else {
                console.log(err);
                return res.status(400).send(err);
            }
        });
    } else { // regular query
        return RestaurantModel.find(function (err, restaurants) {
            if (!err) {
                return res.send(restaurants);
            } else {
                console.log(err);
                return res.status(400).send(err);
            }
        });
    }
};

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
};

/**
 * Update restaurant queue
 *
 * @param req
 * @param res
 */
exports.updateRestaurantQueue = function(req, res) {

    UserController.getCurrentUser(req, res, function(user) {
        RestaurantModel.findOne({'id': req.params.id}, function(err, restaurant) {
            if (!err) {
                // compute new queue value
                var timeSlotIndex = Number(req.body.timeSlotIndex);
                var requestedValue = (50 / restaurant.queue.timeSlots.length) * (2 * timeSlotIndex + 1);
                var newValue = (restaurant.queue.value * restaurant.queue.votes + requestedValue) / (restaurant.queue.votes + 1);
                // update restaurant queue
                restaurant.queue.value = newValue;
                restaurant.queue.votes++;
                restaurant.queue.updatedAt = Date.now();
                restaurant.save(function(err) {
                    if (!err) {
                        return res.send(restaurant);
                    } else {
                        console.log(err);
                        return res.status(400).send(err);
                    }
                });
            } else {
                console.log(err);
                return res.status(400).send(err);
            }
        });
    });
};

/**
 * Update restaurant menu
 *
 * @param req
 * @param res
 */
exports.updateRestaurantMenu = function(req, res) {
    RestaurantModel.findOne({'id': req.params.id}, function(err, restaurant) {
        if (!err) {
            // update restaurant queue
            restaurant.menus = req.body.menus;
            restaurant.save(function(err) {
                if (!err) {
                    return res.send(restaurant);
                } else {
                    console.log(err);
                    return res.status(400).send(err);
                }
            });
        } else {
            console.log(err);
            return res.status(400).send(err);
        }
    });
};
