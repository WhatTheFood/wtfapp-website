var request = require('request');
var async = require('async');

var _ = require('lodash');

var RestaurantModel = require('./restaurant.model');
var UserModel = require('../user/user.model');

var Response = require('../../services/response.js');

/****************************** GET ********************************/


/**
 * @api {get} /restaurants/:id Get the feedbacks for the restaurants (TO IMPLEMENT)
 * @apiName GetRestaurantFeedback
 * @apiGroup Restaurant
 *
 * @apiDescription Return the feedback of the restaurant. For the moment, just return the restaurant.
 *
 * @apiParam {Number} id The restaurant id
 *
 * @apiSuccess Restaurant the restaurant
 *
 */
exports.getRestaurantFeedback = function (req, res) {
  return exports.getRestaurant(req, res, false);
};

/**
 * @api {get} /restaurants/:id Get the restaurant
 * @apiName GetRestaurant
 * @apiGroup Restaurant
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess Restaurant the restaurant
 *
 * @apiParam {Number} id The restaurant id
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
         "_id":"5606afe2b5c1c4aea77058d3",
         "id":695,
         "title":"Cafétéria INALCO",
         "lat":48.8274221,
         "lon":2.3757955,
         "area":"Paris 13",
         "opening":"111,111,111,111,111,000,000",
         "closing":"1",
         "accessibility":false,
         "wifi":false,
         "shortdesc":"",
         "description":"Toutes prestations de cafétéria ",
         "access":"RER C - Métro 14 : Bibliothèque François Mitterrand",
         "operationalhours":"Du lundi au vendredi de 8h00 à 20h00",
         "__v":0,
         "queue":{
            "value":0,
            "updatedAt":"2015-09-26T14:46:58.313Z",
            "timeSlots":[
               "-10",
               "10-20",
               "+20"
            ],
            "votes":[

            ]
         },
         "menus":[

         ],
         "menu":{
            "meal":[

            ]
         },
         "payment":[
            {
               "name":"Monéo",
               "_id":"5606afe2b5c1c4aea77058d5"
            },
            {
               "name":"Espèce",
               "_id":"5606afe2b5c1c4aea77058d4"
            }
         ],
         "photo":{
            "src":"",
            "alt":"Cafétéria INALCO"
         },
         "contact":{
            "tel":"",
            "email":""
         },
         "geolocation":{
            "coordinates":[
               2.3757955,
               48.8274221
            ],
            "type":"Point"
         }
      }
 */
exports.getRestaurant = function (req, res, feedback) {

  process_restaurant = function (err, restaurant) {

    if (err) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
    }
    if (!restaurant) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND);
    }
    return Response.success(res, Response.HTTP_OK, restaurant);
  };

  if (feedback)
    return RestaurantModel.findOne({"id": req.params.id}).select("id").select("title").select("lat").select("lon").select("geolocation").select("distance").select("area").select("opening").select("closing").select("accessibility").select("wifi").select("shortdesc").select("description").select("access").select("operationalhours").select("contact").select("photo").select("payment").select("queue").select("menus").exec(process_restaurant);
  else
    return RestaurantModel.findOne({"id": req.params.id}, process_restaurant);
};

/**
 * @api {get} /restaurants/ Get all restaurants for the user
 * @apiName GetRestaurants
 * @apiGroup Restaurant
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The list of the restaurants
 *
 */
exports.getRestaurants = function (req, res) {

  if (req.query.lat && req.query.lng) { // geospatial querying
    var geoJsonTarget = [Number(req.query.lat), Number(req.query.lng)];
    var maxDistance = req.query.maxDistance ? Number(req.query.maxDistance) : 0.5;

    RestaurantModel.aggregate(
    [{
      "$geoNear": {
        "near": geoJsonTarget,
        "maxDistance": maxDistance,
        "distanceField": "distance",
        "spherical": true,
        "distanceMultiplier": 3963.2,
        "query": {
          'is_enable': true,
          menus: {$exists: true, $ne: []}
        }
      }
    }], function (err, geoResults) {

      // handling errors
      if (err) {
        return Response.error(res, Response.MONGODB_ERROR, err);
      }

      return Response.success(res, Response.HTTP_OK, geoResults);
    });
  }
  else { // regular query
    return RestaurantModel.find({menus: {$exists: true}, is_enable: true}, function (err, restaurants) {
      if (err || _.isUndefined(restaurants)) {
        return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
      }
      return Response.success(res, Response.HTTP_OK, restaurants);
    });
  }
};

/**
 * @api {post} /restaurants/refresh Populate database
 * @apiName Refresh
 * @apiGroup Restaurant
 *
 * @apiError 5002 Async error
 */
exports.refreshAll = function (req, res) {

  /* get json file and parse it */
  // ori : http://www.stockcrous.fr/static/json/crous-paris.min.json
  // fake : https://s3-eu-west-1.amazonaws.com/crousdata.whatthefood/fakecrous.min.js
  // old fake : http://thepbm.ovh.org/static/json/crous-poitiers.min.json
  request('https://s3-eu-west-1.amazonaws.com/crousdata.whatthefood/fakecrous.min.js', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body.replace(new RegExp('\r?\n', 'g'), ' '));

      /* update */
      async.each(data.restaurants, function (element, callback) {
        RestaurantModel.findOne({"id": element.id}, function (err, restaurant) {
          if (restaurant === null) {
            console.log("Creation : " + element.id);
            new RestaurantModel(element).save();
          }
          else {
            console.log("Update : " + element.id);
            restaurant.set(element);
            restaurant.save(function (err) {
              if (err) {
                callback(err);
              }
              else {
                callback(null);
              }
            });
          }
        });
      }, function (err) {

        if (err)
          return Response.error(res, Response.ASYNC_ERROR, err);

        return Response.success(res, Response.HTTP_OK);

      });

    }
  });

  return Response.success(res, Response.HTTP_OK, {});
};

/**
 * @api {post} /restaurants/:id/queue/votes Vote on restaurant queue
 * @apiName VoteOnRestaurantQueue
 * @apiGroup Restaurant
 *
 * @apiParam {Number} id The restaurant id
 *
 * @apiParam {Number} timeSlotIndex the index of time slot chosen
 *
 * @apiError 4002 Restaurant not found
 * @apiError 1001 Bad request
 *
 * @apiSuccess {Restaurant} The restaurant
 */
exports.voteOnRestaurantQueue = function (req, res) {

  var user = req.user;
  RestaurantModel.findOne({'id': req.params.id}, function (err, restaurant) {

    if (err) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
    }
    if (!restaurant) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
    }
    restaurant.voteOnQueue(user, Number(req.body.timeSlotIndex));
    updateUserActionCount(user);

    restaurant.save(function (err) {
      if (err) {
        return Response.error(res, Response.BAD_REQUEST, err);
      }
      return Response.success(res, Response.HTTP_OK, restaurant);
    });
  });
};

/// TODO: refactor
/**
 * @api {post} /restaurants/:id/menu Add feedback
 * @apiName AddFeedback
 * @apiGroup Restaurant

 * @apiPermission admin
 *
 * @apiParam {Number} id The restaurant id
 *
 * @apiError 4002 Restaurant not found
 * @apiError 1001 Bad request
 *
 * @apiSuccess {Restaurant} The restaurant
 */
exports.addFeedback = function (req, res) {

  RestaurantModel.findOne({'id': req.params.id}, function (err, restaurant) {

    if (err) {
      return Response.error(res, Response.BAD_REQUEST, err);
    }

    if (!restaurant) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND);
    }

    // update restaurant queue
    restaurant.menus = req.body.menus;

    // cf https://github.com/WhatTheFood/wtfapp-mobileapp/blob/master/www/WhatTheFood/components/Lunch/lunchquizzctrl.js
    // TODO: set userid here

    restaurant.save(function (err) {

      if (err) {
        return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
      }

      return Response.success(res, Response.HTTP_OK, restaurant);
    });

  });
};

var updateUserActionCount = function (user) {
  user.queueFeedbacksCount = user.queueFeedbacksCount || 0;
  user.queueFeedbacksCount += 1;
  user.points = user.points || 0;
  user.points += UserModel.POINTS_PER_ACTION;
  user.save();
};
