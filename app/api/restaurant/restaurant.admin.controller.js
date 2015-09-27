var request = require('request');
var async = require('async');

var _ = require('lodash');

var RestaurantModel = require('./restaurant.model');
var UserModel = require('../user/user.model');

var Response = require('../../services/response.js');

/**
 * @api {get} /restaurants/admin/ Get all restaurants for the administrator
 * @apiName GetRestaurantsForAdmin
 * @apiGroup RestaurantAdmin
 *
 * @apiPermission admin
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The list of the restaurants
 *
 */
exports.getRestaurantsForAdmin = function(req, res) {

  return RestaurantModel.find({}, function (err, restaurants) {
    if (err || _.isUndefined(restaurants)) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
    }
    return Response.success(res, Response.HTTP_OK, restaurants);
  });

};

/**
 * @api {post} /restaurants/admin/enable Enable the restaurant
 * @apiName EnableRestaurant
 * @apiGroup RestaurantAdmin
 *
 * @apiParam restaurantId the restaurant id
 *
 * @apiPermission admin
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The restaurant
 *
 */
exports.postEnableRestaurant = function(req, res) {

  if (_.isUndefined(req.body.restaurantId)) {
    return Response.error(res, Response.BAD_REQUEST, "You must set the restaurant id on the body");
  }

  RestaurantModel.findOne({'id': req.body.restaurantId}, function (err, restaurant) {

    if (err || _.isUndefined(restaurant)) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
    }

    restaurant.is_enable = true;
    restaurant.save(function (err) {
      if (err) {
        return Response.error(res, Response.MONGODB_ERROR, err);
      }
      return Response.success(res, Response.HTTP_OK, restaurant);
    });

  });

};

/**
 * @api {post} /restaurants/admin/disable Disable the restaurant
 * @apiName DisableRestaurant
 * @apiGroup RestaurantAdmin
 *
 * @apiParam restaurantId the restaurant id
 *
 * @apiPermission admin
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The restaurant
 *
 */
exports.postDisableRestaurant = function(req, res) {

  if (_.isUndefined(req.body.restaurantId)) {
    return Response.error(res, Response.BAD_REQUEST, "You must set the restaurant id on the body");
  }

  RestaurantModel.findOne({'id': req.body.restaurantId }, function(err, restaurant) {

    if (err || _.isUndefined(restaurant)) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
    }

    restaurant.is_enable = false;
    restaurant.save(function(err) {
      if (err) {
        return Response.error(res, Response.MONGODB_ERROR, err);
      }
      return Response.success(res, Response.HTTP_OK, restaurant);
    });

  });

};

/**
 * @api {post} /restaurants/refresh Populate database
 * @apiName Refresh
 * @apiGroup RestaurantAdmin
 *
 * @apiError 5002 Async error
 */
exports.refreshAll = function (req, res) {

  /* get json file and parse it */
  // ori : http://www.stockcrous.fr/static/json/crous-paris.min.json
  // fake : https://s3-eu-west-1.amazonaws.com/crousdata.whatthefood/fakecrous.min.js
  // old fake : http://thepbm.ovh.org/static/json/crous-poitiers.min.json
  request('http://www.stockcrous.fr/static/json/crous-paris.min.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body.replace(new RegExp('\r?\n', 'g'), ' '));

      /* update */
      async.each(data.restaurants, function (element, callback) {

        RestaurantModel.findOne({"id": element.id}, function (err, restaurant) {
          if (restaurant === null) {
            new RestaurantModel(element).save(function() {
              callback(null);
            });
          }
          else {
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
