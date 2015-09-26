var jwt = require('jsonwebtoken');

var UserModel = require('./user.model');
var RestaurantModel = require('../restaurant/restaurant.model');
var BookingModel = require('./booking.model');
var UserTool = require('../../tools/user');
var Tools = require('../../tools/tools');

var config = require('../../config/environment');

var Response = require('../../services/response.js');
/*
 * /users
 * GET users listing
 */
exports.getUsers = function(req, res) {
  return UserModel.find(function (err, users) {
    if (!err) {
      return Response.success(res, Response.HTTP_OK, users);
    }
    else {
      return Response.error(res, Response.UNKNOWN_ERROR, err);
    }
  });
};

/*
 * /users/me
 * Get current user infos
 */
exports.getCurrentUserInfos = function(req, res) {
  return Response.success(res, Response.HTTP_OK, user);
};

/*
 * /users/me/friends
 */
exports.getCurrentUserFriends = function(req, res) {

  UserTool.getUserFriends(user, function(datas) {
    return Response.success(res, Response.HTTP_OK, datas);
  });

};

/*
 * /users/me/restaurant
 * POST restaurant: id
 * @Return user 200
 */
exports.addUserDestination = function(req, res) {

  if (_.isUndefined(body)) {
    return Response.error(res, Response.BAD_REQUEST, "no body");
  }

  var restaurant_id = req.body.restaurantId;
  var when = req.body.when;

  if (!restaurant_id || !when) {
    return Response.error(res, Response.BAD_REQUEST, "restaurant id or when invalid");
  }

  RestaurantModel.findOne({'id': restaurant_id}, function(err, restaurant) {

    if (!restaurant) {
      return Response.error(res, Response.BAD_REQUEST, "Invalid restaurant id");
    }

    var user = req.user;
    var currentDate = Tools.getDayDate();

    BookingModel.findOne({'user': user._id, 'date': currentDate}, function(err, booking) {

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

      booking.save(function(err){
        if (err) {
          return Response.error(res, Response.MONGODB_ERROR, err);
        }
        else {
          user.set({booking: booking});
          user.save(function(err) {
            return Response.success(res, Response.HTTP_OK, booking);
          });
        }
      });
    });

  });

};

/*
 * /me/friends/restaurant
 */
exports.getFriendsAtRestaurant = function(req, res) {

  var restaurant_id = req.body.restaurantId;

  if (!restaurant_id) {
    return Response.error(res, Response.BAD_REQUEST, "You must post a restaurant id");
  }

  UserTool.getUserFriends(user, function(err, res_friends) {

    if (err) {
      return Response.error(res, Response.UNKNOWN_ERROR, err);


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

    }

  });

};

/* POST user listing. */
exports.postUser = function (req, res, next){

  var newUser = new UserModel(req.body);

  newUser.provider = 'local';
  newUser.role = 'user';

  newUser.save(function(err, user) {

    if (err) {
      return Response.error(res, Response.USER_VALIDATION_ERROR, err);
    }
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    return Response.success(res, Response.HTTP_CREATED, { token: token });
  });
};

/* GET user. with id */
exports.getUser = function (req, res) {

  return UserModel.findById(req.params.id, function (err, user) {
    if (!err) {
      return Response.success(res, Response.HTTP_OK, user);

    } else {
      return Response.error(res, Response.USER_NOT_FOUND, err);
    }
  });

};

exports.getToques = function (req, res) {

  return UserModel.find({}, function (err, users) {
    if (!err) {
      return Response.success(res, Response.HTTP_OK, users);
    }
    else {
      return Response.error(res, Response.MONGODB_ERROR, err);
    }
  }).sort({points: -1});

};

/* PUT user. with id */
exports.putUser = function (req, res) {

  UserModel.findById(req.params.id, function (err, user) {

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

/* DEL user.with id */
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
    user.points += config.all.POINTS_PER_ACTION;

  } else {
    user.points = config.all.POINTS_PER_ACTION;
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
