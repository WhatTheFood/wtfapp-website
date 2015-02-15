var express = require('express');
var router = express.Router();

var tokenManager = require('../config/token_manager');
var UserModel = require('../models/user');
var RestaurantModel = require('../models/restaurant');
var UserTool = require('../tools/user');

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
}

/*
 * /users/me
 * Get current user infos
*/
exports.getCurrentUser = function(req, res) {

    getCurrentUser(req, res, function(user) {
        return res.status(200).send(UserTool.getUserBasicInfos(user));
    });
}

/*
 * /users/me/friends
 */
exports.getCurrentUserFriends = function(req, res) {

    getCurrentUser(req, res, function(user) {
        UserTool.getUserFriends(user, function(datas) {
            return res.status(200).send(datas)
        });
    });
}

/*
 * /users/me/restaurant
 * POST restaurant: id
 * @Return user 200
 */
exports.addUserDestination = function(req, res) {
    getCurrentUser(req, res, function(user) {
        var restaurant_id = req.body.restaurantId
        if (!restaurant_id) {
            return res.status(400).send("You must post a restaurant id");
        }
        RestaurantModel.findOne({'id': restaurant_id}, function(err, restaurant) {
            if (err) {
                return res.status(503).send(err);
            }
            else if (!restaurant) {
                return res.status(400).send("Invalid id");
            }
            else {
                user.set({
                    'today_destination': {
                        'restaurant': restaurant.id,
                        'date': Date.now(),
                    }
                });
                user.save();
                return res.status(200).send(user);
            }
        });
    });
}

/*
 * /me/friends/restaurant
 */
exports.getFriendsAtRestaurant = function(req, res) {
    getCurrentUser(req, res, function(user) {
        var restaurant_id = req.body.restaurantId

        if (!restaurant_id) {
            return res.status(400).send("You must post a restaurant id");
        }
        UserTool.getUserFriends(user, function(err, friends) {

            if (err) {
                return res.status(200).send(err);
            }
            var datas = [];
            friends.forEach(function(friend) {
                if (friend.today_destination !== 'undifined') {
                    if (friend.today_destination.restaurant.id == restaurant_id) {
                        friend['today_destination'] = ''; // To debug
                        datas.push(friend);
                    }
                }
            });
            return res.status(200).send(datas)
        });
    });
}

getCurrentUser = function(req, res, callback) {
    var token = tokenManager.getToken(req.headers);

    UserModel.findOne({token: token }, function (err, user) {
        if (err) {
            return res.status(503).send(err)
        }
        else if (!user) {
            return res.status(503).send({ 'message': 'Invalid token.' });
        }
        else {
            callback(user);
        }
    });
}

/* POST user listing. */
exports.postUser = function (req, res){
  var user;
  email = req.body.email;
  pwd = req.body.password;
  if (!email || !pwd) {
    return res.status(400).send({"error": "Invalid request"});
  }
  user = new UserModel({
    email:email,
    password: password,
  });
  user.save(function (err) {
    if (!err) {
      console.log("created");
      return res.send(user);
    } else {
      console.log(err);
      return res.status(400).send(err);
    }
  });
}

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
}

/* PUT user. with id */
exports.putUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {

    if(req.body.email)
      user.email = req.body.email;

    if(req.body.password) {
      if (req.body.password.length > 30) {
          return res.status(400).send({ 'password': 'must be at least 5 characters and at most 30.'})
      } else {
        user.password = req.body.password;
      }
    }


    return user.save(function (err) {
      if (!err) {
        console.log("updated");
        return res.send(user);
      } else {
        console.log(err);
        return res.status(400).send(err);
      }
    });
  });
}

/* DEL user.with id */
exports.deleteUser = function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
        return res.status(400).send(err);
      }
    });
  });
}
