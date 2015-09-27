var request = require('request');
var async = require('async');

var _ = require('lodash');

var RestaurantModel = require('./restaurant.model');
var UserModel = require('../user/user.model');

var Response = require('../../services/response.js');

/**
 * @api {get} /restaurants/admin/ Get all restaurants for the administrator
 * @apiName GetRestaurantsForAdmin
 * @apiGroup Restaurant
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
 * @apiGroup Restaurant
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
 * @apiGroup Restaurant
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


