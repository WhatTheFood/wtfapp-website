var express = require('express');
var router = express.Router();

var UserModel = require('../models/user');
var RestaurantModel = require('../models/restaurant');
var BookingModel = require('../models/previsions.js');
var UserTool = require('../tools/user');
var Tools = require('../tools/tools.js');

var SecurityService = require('../services/security-service');

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
exports.getCurrentUserInfos = function(req, res) {

    SecurityService.getCurrentUser(req, res, function(user) {
        return res.status(200).send(UserTool.getUserBasicInfos(user));
    });
}

/*
 * /users/me/friends
 */
exports.getCurrentUserFriends = function(req, res) {

    SecurityService.getCurrentUser(req, res, function(user) {
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
    if (req.body === 'undifined') {
        return res.status(400).send("Invalid request");
    }
    var restaurant_id = req.body.restaurantId
    var when = req.body.when
    if (!restaurant_id || !when) {
        return res.status(400).send("You must post a restaurant id");
    }

    SecurityService.getCurrentUser(req, res, function(user) {
       RestaurantModel.findOne({'id': restaurant_id}, function(err, restaurant) {
            if (!restaurant) {
                return res.status(400).send("Invalid restaurant id");
            }
            else {
                date = Tools.getDayDate()
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
                    }
                    else {
                        booking.set({
                            user: user._id,
                            when: when,
                            restaurant: restaurant.id,
                        });
                    }
                    booking.save(function(err){
                        if (err) {
                            return res.status(400).send(err);
                        }
                        else {
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
}

/*
 * /me/friends/restaurant
 */
exports.getFriendsAtRestaurant = function(req, res) {
    SecurityService.getCurrentUser(req, res, function(user) {
        var restaurant_id = req.body.restaurantId

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
            console.log(num);

            if (!num) {
                console.log("Sans amis :(");
                return res.status(200).send([]);
            }

            res_friends.forEach(function(friend) {
                console.log(friend.id, " // ", friend.first_name);
                BookingModel.findOne({ user: friend.id, //date: date,  restaurant: restaurant_id
                }, function(err, booking) {
                    if (err) {
                        return res.status(503).send(err);
                    }
                    console.log("booking:", booking);
                    if (booking) {
                        if (booking.restaurant == restaurant_id) {
                            var date = Tools.getDayDate();
                            if (friend.booking && friend.booking.date != date) {
                                friend.booking = "";
                                console.log("remove Booking !!!");
                            }
                            ret_datas.push(friend);
                        }
                    }
                    if (--num == 0) {
                        console.log("RET");
                        console.log(ret_datas);
                        return res.status(200).send(ret_datas);
                    }
                });
            });
        });
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
