var express = require('express');
var request = require('request');
var router = express.Router();
var SecurityService = require('../services/security-service');
var RestaurantModel = require('../models/restaurant');
var UserModel = require('../models/user.js');

/****************************** GET ********************************/

/**
 * Get restaurant
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.getRestaurantWFeedback = function (req, res) {
  return exports.getRestaurant(req, res, true);
};
exports.getRestaurantWOFeedback = function (req, res) {
  return exports.getRestaurant(req, res, false);
};
exports.getRestaurant = function (req, res, feedback) {

  process_restaurant = function (err, restaurant) {
    console.log(req.query);
    if (!err) {
      return res.send(restaurant);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  };

  if (feedback)
    return RestaurantModel.findOne({"id": req.params.id}).select("id").select("title").select("lat").select("lon").select("geolocation").select("distance").select("area").select("opening").select("closing").select("accessibility").select("wifi").select("shortdesc").select("description").select("access").select("operationalhours").select("contact").select("photo").select("payment").select("queue").select("menus").select("menu").exec(process_restaurant);
  else
    return RestaurantModel.findOne({"id": req.params.id}, process_restaurant);
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

    RestaurantModel.geoNear(geoJsonTarget, {spherical: true, maxDistance: maxDistance, query: {menus: {$exists: true, $ne: []}}}, function (err, geoResults, stats) {
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
    return RestaurantModel.find({menus: {$exists: true, $ne: []}}, function (err, restaurants) {
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
  // ori : http://www.stockcrous.fr/static/json/crous-paris.min.json
  // fake : https://s3-eu-west-1.amazonaws.com/crousdata.whatthefood/fakecrous.min.js
  request('https://s3-eu-west-1.amazonaws.com/crousdata.whatthefood/fakecrous.min.js', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body.replace(new RegExp('\r?\n','g'), ' '));

      /* update */
      data.restaurants.forEach(function(element, index) {
        RestaurantModel.findOne({"id": element.id}, function (err, restaurant){
          if(restaurant === null)
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
 * Vote on restaurant queue
 *
 * @param req
 * @param res
 */
exports.voteOnRestaurantQueue = function (req, res) {
  SecurityService.getCurrentUser(req, res, function(user) {
    RestaurantModel.findOne({'id': req.params.id}, function(err, restaurant) {
      if (!err) {
        restaurant.voteOnQueue(user, Number(req.body.timeSlotIndex));
        updateUserActionCount(user);

        restaurant.save(function(err) {
          if (!err) {
            return res.send(restaurant);
          } else {
            console.log(err);
            return res.status(500).send(err);
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

var updateUserActionCount = function (user) {
  user.queueFeedbacksCount = user.queueFeedbacksCount || 0;
  user.queueFeedbacksCount += 1;
  user.points = user.points || 0;
  user.points += UserModel.POINTS_PER_ACTION;
  user.save();
};
