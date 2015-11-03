var jwt = require('jsonwebtoken');
var _ = require('lodash');
var moment = require('moment');
var Q = require('q');
var config = require('../../config/environment');

var Response = require('../../services/response.js');
var RestaurantModel = require('../restaurant/restaurant.model')
var FacebookTools = require('../user/facebook.tools.js');
var UserModel = require('../user/user.model');

/**
 * @api {get} /stats/me get the stats for the current user
 * @apiName GetStats
 * @apiGroup Stats
 *
 * @apiSuccess Stats The stats.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {"me":{"score":42},"friends":{"scores":[{"name":"Jean-Jean","picture":"/fake","score":600},{"name":"DaphnÃ©","picture":"/fake","score":550},{"name":"Robert","picture":"/fake","score":400},{"name":"Alfred","picture":"/fake","score":120},{"name":"Romuald","picture":"/fake","score":80},{"name":"fel","picture":"/fake","score":60},{"name":"Claire","picture":"/fake","score":20}]},"restaurants":{"scores":[{"name":"RU Censier","picture":"/fake","score":6000},{"name":"RU Hall aux Farines","picture":"/fake","score":5500},{"name":"RU Dauphine","picture":"/fake","score":4000},{"name":"RU XXX","picture":"/fake","score":1200}]}}
 *
 * Can't fail with a 404 because we check if the user is authenticate before call this function
 */
exports.getStats = function (req, res) {
  var user = req.user;
  var stats = {
    "me": {"score": user.points || 0},
    "friends": {"scores": []},
    restaurants: {
      scores: [
        {"name": "RU Censier", "picture": "/fake", "score": 0},
        {"name": "RU Halles aux Farines", "picture": "/fake", "score": 0},
        {"name": "RU Dauphine", "picture": "/fake", "score": 0}
      ]
    }
  };


  return FacebookTools
    .getUserFacebookFriendsPromised(user.fb.access_token)
    .then(function (friends) {
      console.log("friends", friends);
      var friendIds = friends.map(function (friend) {
        return friend.id
      });
      return friendIds;
    })
    .then(function (friendsIds) {
      friendsIds.push(user.fb.id);// Adds myself to the list
      console.log("friendsIds", friendsIds);
      return UserModel.find({"fb.id": {$in: friendsIds}}).sort({points: -1}).limit(10);
    })
    .then(function (sortedFriends) {
        if (sortedFriends.length == 0) {
          sortedFriends.push(user);// Adds myself to the list
        }
        console.log("sortedFriends", sortedFriends);
        stats.friends.scores = sortedFriends.map(function (u) {
          // create the user for the view
          var user = {
            score : u.points,
            name: u.first_name + " " + u.last_name,
            picture: u.avatar
          }
          return user
        });
        return stats
      }, function (err) {
        console.log(err);
        return stats
      }
    )
    .then(function () {
      return RestaurantModel.find({menus: {$exists: true}, is_enable: true}).select("points").select("title")
        .exec();
    })
    .then(function (restaurants) {
      console.log(restaurants)
      return restaurants.map(function (r) {
        r.name = r.title;
        r.score = r.points || 0;
        return r;
      })
    })
    .then(function (restaurants) {
      stats.restaurants.scores = restaurants;
      console.log('JSON', JSON.stringify(stats));
      return Response.success(res, Response.HTTP_OK, stats);
    });


};
