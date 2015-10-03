var jwt = require('jsonwebtoken');
var _ = require('lodash');
var moment = require('moment');

var UserModel = require('./user.model');
var RestaurantModel = require('../restaurant/restaurant.model');
var BookingModel = require('./booking.model');
var UserTool = require('./user.tools');

var config = require('../../config/environment');

var Response = require('../../services/response.js');
var statsController = {};

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
statsController.getStats = function (req, res) {
  var stats = {
    me: {
      score: 42
    },
    friends: {
      scores:[
        {
          name : "Jean-Jean",
          picture: "/fake",
          score: 600
        },
        {
          name : "Daphné",
          picture: "/fake",
          score: 550
        },
        {
          name : "Robert",
          picture: "/fake",
          score: 400
        },
        {
          name : "Alfred",
          picture: "/fake",
          score: 120
        },
        {
          name : "Romuald",
          picture: "/fake",
          score: 80
        },
        {
          name : "fel",
          picture: "/fake",
          score: 60
        },
        {
          name : "Claire",
          picture: "/fake",
          score: 20
        }
      ]
    },
    restaurants: {
      scores:[
        {
          name : "RU Censier",
          picture: "/fake",
          score: 6000
        },
        {
          name : "RU Hall aux Farines",
          picture: "/fake",
          score: 5500
        },
        {
          name : "RU Dauphine",
          picture: "/fake",
          score: 4000
        },
        {
          name : "RU XXX",
          picture: "/fake",
          score: 1200
        }
      ]
    }
  };

  return Response.success(res, Response.HTTP_OK, stats);
};
