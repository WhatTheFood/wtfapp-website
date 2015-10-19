var request = require('request');
var async = require('async');

var _ = require('lodash');

var MenuModel = require('../menu/menu.model.js');
var RestaurantModel = require('./restaurant.model');
var UserModel = require('../user/user.model');

var Response = require('../../services/response.js');

/**
 * @api {get} /restaurants/admin/ Get all restaurants for the administrator
 * @apiName GetRestaurantsForAdmin
 * @apiGroup Restaurant Admin
 *
 * @apiPermission admin
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The list of the restaurants
 *
 */
exports.getRestaurantsForAdmin = function (req, res) {

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
 * @apiGroup Restaurant Admin
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
exports.postEnableRestaurant = function (req, res) {

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
 * @apiGroup Restaurant Admin
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
exports.postDisableRestaurant = function (req, res) {

  if (_.isUndefined(req.body.restaurantId)) {
    return Response.error(res, Response.BAD_REQUEST, "You must set the restaurant id on the body");
  }

  RestaurantModel.findOne({'id': req.body.restaurantId}, function (err, restaurant) {

    if (err || _.isUndefined(restaurant)) {
      return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
    }

    restaurant.is_enable = false;
    restaurant.save(function (err) {
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
 * @apiGroup Restaurant Admin
 *
 * @apiError 5002 Async error
 */
exports.refreshAll = function (req, res) {
  console.time("refresh");
  /* get json file and parse it */
  // ori : http://www.stockcrous.fr/static/json/crous-paris.min.json
  // fake : https://s3-eu-west-1.amazonaws.com/crousdata.whatthefood/fakecrous.min.js
  // old fake : http://thepbm.ovh.org/static/json/crous-poitiers.min.json
  request('http://www.stockcrous.fr/static/json/crous-paris.min.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body.replace(new RegExp('\r?\n', 'g'), ' '));
      var today = new Date().toISOString().slice(0,10);

      // MenuModel.where("date").gt(today).remove().exec(); //XXX
      MenuModel.remove({date: {$gt: today}}).exec()

      /* update */
      async.each(data.restaurants, function (element, callback) {

        // For each restaurant
        // Save the menus
        var menus = [];

        if (element.menus.length > 0) {
          var menu = {};
          menu.idRestaurant = element.id; // External CROUS ID
          element.menus.forEach(function (iMenu) {
            menu.date = iMenu.date;
            menu.dishes = [];
            if (menu.date <= today)
              return;

            iMenu.meal.forEach(function (meal) {
              menu.name = meal.name;
              meal.foodcategory.forEach(function (foodcategory) {
                foodcategory.dishes.forEach(function (dish) {
                  var pDish = {};
                  pDish.category = foodcategory.name;
                  pDish.name = dish.name;
                  menu.dishes.push(pDish);
                })
                menus.push(menu);
              });
            });


            var Menu = new MenuModel(menu);
            Menu.save(function (err, m) {
              if (err) {
                return Response.error(res, Response.MENU_UPDATE_ERROR, err);
              }
            });
          })
        }


        RestaurantModel.findOne({"id": element.id}, function (err, restaurant) {
            // Save or update the restaurant
            if (restaurant === null) {
              new RestaurantModel(element).save(function () {
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
          }
        );
      }, function (err) {

        if (err)
          return Response.error(res, Response.ASYNC_ERROR, err);

        return Response.success(res, Response.HTTP_OK);

      })
      console.timeEnd("refresh")
    }
  });

  return Response.success(res, Response.HTTP_OK, {});
};

/**
 * @api {put} /users/:id Update a user
 * @apiName PutUser
 * @apiGroup User
 *
 * @apiParam id The user id
 *
 * @apiE
 *
 * @apiError 1001 Bad request
 * @apiError 4001 User not found
 *
 * @apiSuccess User the updated user
 *
 * The put of the user can :
 *
 * - Update user information
 * - Update a preference
 * - Run an action
 *
 */
exports.putUser = function (req, res) {

  if (_.isUndefined(req.params.id)) {
    return Response.error(req, Response.BAD_REQUEST, "id not provide");
  }

  UserModel.findById(req.params.id, function (err, user) {

    if (!user) {
      return Response.error(res, Response.USER_NOT_FOUND);
    }

    if (err) {
      return Response.error(res, Response.USER_NOT_FOUND, err);
    }

    // first we check the password constraint
    if (req.body.password) {
      var response = updateUserPassword(user, req.body.password);
      if (response){
        return response;
      }
    }

    // then -- We want to update a preference
    if (req.body.preference) {
      var response = updateUserPreferences(user, req.body.preference);
      if (response){
        return response;
      }
    }

    if (req.body.email) {
      user.email = req.body.email;
    }


    if (req.body.first_name) {
      user.first_name = req.body.first_name;
    }

    if (req.body.last_name) {
      user.last_name = req.body.last_name;
    }

    // -- We want to run an action
    if (req.body.action) {
      switch (req.body.action) {
        case 'increase_points':
          user = updateUserPoints(user);
          user = updateActionCount(user, req.body.reason);
          break;
      }
    }

    return user.save(function (err) {
      if (!err) {
        return Response.success(res, Response.HTTP_OK, user);
      }
      else {
        return Response.error(res, Response.USER_NOT_FOUND, err);
      }
    });
  });

};
