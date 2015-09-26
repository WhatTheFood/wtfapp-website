var jwt = require('jsonwebtoken');

var UserModel = require('./user.model');
var RestaurantModel = require('../restaurant/restaurant.model');
var BookingModel = require('./booking.model');
var UserTool = require('../../tools/user');
var Tools = require('../../tools/tools');

var Response = require('../../services/response.js');
/*
 * /users
 * GET users listing
 */
exports.getUsers = function(req, res) {
  return UserModel.find(function (err, users) {
    if (!err) {
      return res.send(users);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
};

/*
 * /users/me
 * Get current user infos
 */
exports.getCurrentUserInfos = function(req, res) {
  SecurityService.getCurrentUser(req, res, function(user) {
    return res.status(200).send(user);
  });
};

/*
 * /users/me/friends
 */
exports.getCurrentUserFriends = function(req, res) {
  SecurityService.getCurrentUser(req, res, function(user) {
    UserTool.getUserFriends(user, function(datas) {
      return res.status(200).send(datas);
    });
  });
};

/*
 * /users/me/restaurant
 * POST restaurant: id
 * @Return user 200
 */
exports.addUserDestination = function(req, res) {
  if (req.body === 'undifined') {
    return res.status(400).send("Invalid request");
  }
  var restaurant_id = req.body.restaurantId;
  var when = req.body.when;
  if (!restaurant_id || !when) {
    return res.status(400).send("You must post a restaurant id");
  }

  SecurityService.getCurrentUser(req, res, function(user) {
    RestaurantModel.findOne({'id': restaurant_id}, function(err, restaurant) {
      if (!restaurant) {
        return res.status(400).send("Invalid restaurant id");

      } else {
        date = Tools.getDayDate();
        BookingModel.findOne({'user': user._id, 'date': date}, function(err, booking) {
          if (err) {
            return res.status(503).send(err);
          }

          if (!booking) {
            // create booking
            booking = new BookingModel({
              user: user._id,
              date: date,
              when: when,
              restaurant: restaurant.id,
            });
          } else {
            booking.set({
              user: user._id,
              when: when,
              restaurant: restaurant.id,
            });
          }

          booking.save(function(err){
            if (err) {
              return res.status(400).send(err);
            } else {
              user.set({booking: booking});
              user.save(function(err) {
                return res.status(200).send("OK");
              });
            }
          });
        });
      }
    });
  });
};

/*
 * /me/friends/restaurant
 */
exports.getFriendsAtRestaurant = function(req, res) {
  SecurityService.getCurrentUser(req, res, function(user) {
    var restaurant_id = req.body.restaurantId;

    if (!restaurant_id) {
      return res.status(400).send("You must post a restaurant id");
    }

    UserTool.getUserFriends(user, function(err, res_friends) {

      if (err) {
        return res.status(200).send(err);
      }
      var ret_datas = [];
      var date = Tools.getDayDate();
      var num = res_friends.length;

      if (!num) {
        return res.status(200).send([]);
      }

      res_friends.forEach(function(friend) {
        BookingModel.findOne({ user: friend.id, //date: date,  restaurant: restaurant_id
        }, function(err, booking) {
          if (err) {
            return res.status(503).send(err);
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
            return res.status(200).send(ret_datas);
          }
        });
      });
    });
  });
};

/* POST user listing. */
exports.postUser = function (req, res, next){
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.save(function(err, user) {

      if (err) {
        Response.error(res, Response.USER_VALIDATION_ERROR, err);
      }
      var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
      Response.success(res, Response.HTTP_CREATED, { token: token });

    });
};

/* GET user. with id */
exports.getUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    if (!err) {
      return res.send(user);

    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
};

exports.getToques = function (req, res) {
  return UserModel.find({}, function (err, users) {
    if (!err) {
      return res.send(users);

    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  }).sort({points: -1});
};

/* PUT user. with id */
exports.putUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {

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
        return res.send(user);

      } else {
        console.log(err);
        return res.status(400).send(err);
      }
    });
  });
};

/* DEL user.with id */
exports.deleteUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        return res.send('');
      } else {
        console.log(err);
        return res.status(400).send(err);
      }
    });
  });
};

var createUserToken = function (user) {
  user.set({'token': token});
  return user;
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
    user.points += UserModel.POINTS_PER_ACTION;

  } else {
    user.points = UserModel.POINTS_PER_ACTION;
  }

  return user;
};

var updateUserPassword = function (user, password) {
  if (req.body.password.length > 30) {
    return res.status(400).send({'password': 'must be at least 5 characters and at most 30.'});

  } else {
    user.password = req.body.password;
  }
};
