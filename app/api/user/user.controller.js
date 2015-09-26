var jwt = require('jsonwebtoken');
var _ = require('lodash');

var UserModel = require('./user.model');
var RestaurantModel = require('../restaurant/restaurant.model');
var BookingModel = require('./booking.model');
var UserTool = require('../../tools/user');
var Tools = require('../../tools/tools');

var config = require('../../config/environment');

var Response = require('../../services/response.js');

/**
 * @api {get} /users Get all users
 * @apiName GetAllUsers
 * @apiGroup User
 *
 * @apiPermission admin
 *
 * @apiError 500 Unknwon error
 *
 * @apiSuccess [User] A list of the users
 *
 */
exports.getUsers = function (req, res) {
  return UserModel.find(function (err, users) {
    if (err) {
      return Response.error(res, Response.UNKNOWN_ERROR, err);
    }
    return Response.success(res, Response.HTTP_OK, users);
  });
};

/**
 * @api {get} /users/me Get the current user
 * @apiName GetCurrentUser
 * @apiGroup User
 *
 * @apiDescription Can't fail because we check if the user is authenticate before call this function
 *
 * @apiSuccess User The current user.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
         "_id":"5606ae7432b3eee25ec062ac",
         "provider":"local",
         "email":"test@test.fr",
         "hashedPassword":"0n9z8uRd/R3z64wqxoVPz4psEa6dAfXnOBV6JjnQDf8NUF0Zh0fgh6SpYI1CPg9819WGvY6KXOrmXFqsY64Y0g==",
         "salt":"xdM3xXsrdTpH0me/as3uaw==",
         "__v":0,
         "preferences":[

         ],
         "avatar":"",
         "last_name":"",
         "first_name":"",
         "facebook_id":0,
         "loginAttempts":0,
         "role":"user"
      }
 *
 */
exports.getCurrentUserInfos = function (req, res) {
  return Response.success(res, Response.HTTP_OK, req.user);
};

/**
 * @api {get} /users/friends Get the current user friends
 * @apiName GetCurrentUserFriends
 * @apiGroup User
 *
 * @apiError 500 Facebook failed.
 *
 * @apiSuccess [User] A list of friends
 *
 */
exports.getCurrentUserFriends = function (req, res) {

  UserTool.getUserFriends(req.user, function (err, datas) {
    if (err) {
      return Response.error(res, Response.UNKNOWN_ERROR, err);
    }
    return Response.success(res, Response.HTTP_OK, datas);
  });

};

/**
 * @api {post} /users/me/restaurant Post a check-in for the user
 * @apiName AddCurrentUserDestination
 * @apiGroup User
 *
 * @apiParam restaurantId the id of the restaurant
 * @apiParam when         when the user will come to the restaurant
 *
 * @apiSuccess Booking The created booking
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id":"5606c1ae358f01edf3c8424d",
    "user":"5606ae7432b3eee25ec062ac",
    "date":"26/9/2015",
    "when":"12:00",
    "restaurant":"695",
    "__v":0
 }
 *
 * @apiError 1001 Restaurant id or when invalid
 * @apiError 5001 Mongodb error
 */
exports.addUserDestination = function (req, res) {

  if (_.isUndefined(req.body)) {
    return Response.error(res, Response.BAD_REQUEST, "no body");
  }

  var restaurant_id = req.body.restaurantId;
  var when = req.body.when;

  if (!restaurant_id || !when) {
    return Response.error(res, Response.BAD_REQUEST, "restaurant id or when invalid");
  }

  RestaurantModel.findOne({'id': restaurant_id}, function (err, restaurant) {

    if (!restaurant) {
      return Response.error(res, Response.BAD_REQUEST, "Invalid restaurant id");
    }

    var user = req.user;
    var currentDate = Tools.getDayDate();

    BookingModel.findOne({'user': user._id, 'date': currentDate}, function (err, booking) {

      if (err) {
        return Response.error(res, Response.MONGODB_ERROR, err);
      }

      if (!booking) {
        // create booking
        booking = new BookingModel({
          user: user._id,
          date: currentDate,
          when: when,
          restaurant: restaurant.id
        });

      } else {
        booking.set({
          user: user._id,
          when: when,
          restaurant: restaurant.id
        });
      }

      booking.save(function (err) {
        if (err) {
          return Response.error(res, Response.MONGODB_ERROR, err);
        }
        else {
          user.set({booking: booking});
          user.save(function (err) {
            return Response.success(res, Response.HTTP_OK, booking);
          });
        }
      });
    });

  });

};

/**
 * @api {get} /users/me/friends/restaurant Get friends who checkin in the restaurant
 * @apiName GetFriendsAtRestaurant
 * @apiGroup User
 *
 * @apiParam restaurantId The restaurant id where check the friends checkin
 *
 * @apiError 1001 Bad request
 * @apiError 500 Unknown. TODO
 *
 * @apiSuccess [User] A list of friends users
 *
 */
exports.getFriendsAtRestaurant = function (req, res) {

  var restaurant_id = req.body.restaurantId;
  var user = req.user;

  if (!restaurant_id) {
    return Response.error(res, Response.BAD_REQUEST, "You must post a restaurant id");
  }

  UserTool.getUserFriends(user, function (err, res_friends) {

    if (err) {
      return Response.error(res, Response.UNKNOWN_ERROR, err);
    }

    var ret_datas = [];
    var num = res_friends.length;

    if (!num) {
      return Response.success(res, Response.HTTP_OK, []);
    }

    res_friends.forEach(function (friend) {
      BookingModel.findOne({
        user: friend.id
        //date: date,  restaurant: restaurant_id
      }, function (err, booking) {
        if (err) {
          return Response.error(res, Response.MONGODB_ERROR, err);
        }
        if (booking) {
          if (booking.restaurant == restaurant_id) {
            var date = Tools.getDayDate();
            if (friend.booking && friend.booking.date == date) {
              ret_datas.push(friend);
            }
          }
        }

        if (--num === 0) {
          return Response.success(res, Response.HTTP_OK, ret_datas);
        }
      });
    });

  });

};

/**
 * @api {get} /users/toques Get users sort by points
 * @apiName GetToques
 * @apiGroup User
 *
 * @apiParam avatar Boolean. Only the user with an avatar will be returns
 *
 * @apiError 50001 Mongodb error
 *
 * @apiSuccess [User] A list of users
 *
 */
exports.getToques = function (req, res) {

  var query = {};
  if (req.query.avatar) { // return only users with an avatar
    query = {
      avatar: { $ne: "" }
    }
  }

  return UserModel.find(query, function (err, users) {
    if (!err) {
      return Response.success(res, Response.HTTP_OK, users);
    }
    else {
      return Response.error(res, Response.MONGODB_ERROR, err);
    }
  }).sort({points: -1});

};

/**
 * @api {get} /users/:id Get a user
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam id The user id
 *
 * @apiError 4001 User not found
 *
 * @apiSuccess User The user
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
         "_id":"5606ae7432b3eee25ec062ac",
         "provider":"local",
         "email":"test@test.fr",
         "hashedPassword":"0n9z8uRd/R3z64wqxoVPz4psEa6dAfXnOBV6JjnQDf8NUF0Zh0fgh6SpYI1CPg9819WGvY6KXOrmXFqsY64Y0g==",
         "salt":"xdM3xXsrdTpH0me/as3uaw==",
         "__v":0,
         "preferences":[

         ],
         "avatar":"",
         "last_name":"",
         "first_name":"",
         "facebook_id":0,
         "loginAttempts":0,
         "role":"user"
      }
 *
 */
exports.getUser = function (req, res) {

  if (!req.params.id) {
    return Response.error(res, Response.BAD_REQUEST, "no id given");
  }

  // TODO: send different informations according to the current user roles

  return UserModel.findById(req.params.id, function (err, user) {
    if (!err) {
      return Response.success(res, Response.HTTP_OK, user);

    } else {
      return Response.error(res, Response.USER_NOT_FOUND, err);
    }
  });

};

/**
 * @api {post} /users Create a new user
 * @apiName PostUser
 * @apiGroup User
 *
 * @apiError 1002 Invalid user
 * @apiError 1004 User already exists
 *
 * @apiSuccess token The user token
 *
 * @apiSuccessExample
 * {
 *  'token': '2392394i329493';
 *  }
 *
 */
exports.postUser = function (req, res, next) {

  var newUser = new UserModel(req.body);

  newUser.provider = 'local';
  newUser.role = 'user';

  UserModel.findOne({'email': req.body.email }, function(err, user) { // search if account already exists

    if (user) {
      return Response.error(res, Response.USER_ALREADY_EXISTS);
    }

    if (err) {
      return Response.error(res, Response.MONGODB_ERROR, err);
    }

    newUser.save(function (err, user) {

      if (err) {
        return Response.error(res, Response.USER_VALIDATION_ERROR, err);
      }
      var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
      return Response.success(res, Response.HTTP_CREATED, {token: token});
    });

  });

};

/**
 * @api {put} /users/:id Update a user
 * @apiName PutUser
 * @apiGroup User
 *
 * @apiParam id The user id
 *
 * @apiError 1001 Bad request
 * @apiError 4001 User not found
 *
 * @apiSuccess User the updated user
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

    if (req.body.email)
      user.email = req.body.email;

    if (req.body.password) {
      user = updateUserPassword(user, req.body.password);
    }

    if (req.body.preference) {
      user = updateUserPreferences(user, req.body.preference);
    }

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

/**
 * @api {delete} /users/:id Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam id The user id
 *
 * @apiError 4001 User not found
 *
 * @apiSuccess 204
 *
 */
exports.deleteUser = function (req, res) {
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        return Response.success(res, Response.HTTP_NO_CONTENT);
      }
      else {
        return Response.error(res, Response.USER_NOT_FOUND, err);
      }
    });
  });
};


var updateUserPreferences = function (user, preferenceInput) {
  if (user.preferences && user.preferences.length > 0) {
    var preferences = user.preferences;

    var found = false;
    preferences.forEach(function (preference, index, preferences) {
      if (preference.name === preferenceInput.name) {
        preferences[index] = preferenceInput;
        found = true;
      }
    });

    if (!found) {
      preferences.push(preferenceInput);
    }

    user.preferences = []; // Trick to force mongo to update array fields
    user.preferences = preferences;

  } else {
    user.preferences = [req.body.preference];
  }

  return user;
};

var updateActionCount = function (user, reason) {
  switch (reason) {
    case 'lunch-quizz':
      user.lunchFeedbacksCount = user.lunchFeedbacksCount || 0;
      user.lunchFeedbacksCount += 1;
      break;

    case 'queue-status':
      user.queueFeedbacksCount = user.queueFeedbacksCount || 0;
      user.queueFeedbacksCount += 1;
      break;
  }

  return user;
};

var updateUserPoints = function (user) {
  if (user.points) {
    user.points += config.POINTS_PER_ACTION;

  }
  else {
    user.points = config.POINTS_PER_ACTION;
  }

  return user;
};

var updateUserPassword = function (user) {
  if (req.body.password.length > 30) {
    return Response.error(res, Response.INVALID_PASSWORD_CONSTRAINT, err);
  }
  else {
    user.password = req.body.password;
  }
};
