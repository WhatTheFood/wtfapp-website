var jwt = require('jsonwebtoken');
var _ = require('lodash');
var moment = require('moment');
var Q = require('q');
var config = require('../../config/environment');

var Response = require('../../services/response.js');
var RestaurantModel = require('../restaurant/restaurant.model')
var FacebookTools = require('../user/facebook.tools.js');

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
    "friends": {"scores":[]},
    restaurants: {
      scores:[
        {"name":"RU Censier","picture":"/fake","score":0},
        {"name":"RU Halles aux Farines","picture":"/fake","score":0},
        {"name":"RU Dauphine","picture":"/fake","score":0}
      ]
    }
  };


  FacebookTools.getUserFacebookFriendsPromised(user.fb.access_token)
    .then(function (friends) {
      var friendIds = friends.map(function (friend) {return friend.id});
      return friendIds;
    })
    .then(function (friendsIds) {
      return UserModel.find({"fb.id": {$in: friendsIds}}).sort({points: -1}).limit(10);
    })
    .then(function (sortedFriends){
      stats.friends.scores = sortedFriends;
    })
    .then(function(){
      console.log(sortedFriends);
  })
  /*
  RestaurantModel.find({is_enable: true}).select("points").select("title")
    .exec().then(function (restaurants) {
       restaurants.map(function (r) {
          console.log("------>",r);
          r.name = r.title;
          if (r.points)
            r.score = r.points;
          else
            r.score = 0;
          return r;
        }
      )
      console.log("found", restaurants)
      stats.restaurants.scores = restaurants;
    })
    ];*/

  //Q.when(results).then(function(results){Response.success(res, Response.HTTP_OK, stats)});
  return Response.success(res, Response.HTTP_OK, stats);
};
