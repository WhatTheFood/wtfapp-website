'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var Response = require('../../services/response.js');

var router = express.Router();

/**
 * @api {post} /auth/local/ Authenticate the user via email and password
 * @apiName NormalLogin
 * @apiGroup Authentication
 *
 * @apiParam {String} email The user email
 * @apiParam {String} password The user password
 *
 * @apiError 401 [401] Unauthorized
 *
 * @apiSuccess token The user token
 *
 * @apiErrorExample {json} Error-Response:
 * {
 *    "message":"Unauthorized",
 *    "code":401,
 *    "detail":{
 *      "message":"This email is not registered."
 *      }
 *    }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "e239ue934289eu23hidu2ub",
 *     }
 *
 */
router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;

    if (error) {
      return Response.error(res, Response.UNAUTHORIZED, error);
    }
    if (!user)  {
      return Response.error(res, Response.UNAUTHORIZED);
    }

    var token = auth.signToken(user._id, user.role);
    Response.success(res, Response.HTTP_OK, {token: token});
  })(req, res, next)
});

/**
 * @api {post} /auth/local/ Authenticate the user via apikey
 * @apiName ApikeyLogin
 * @apiGroup Authentication
 *
 * @apiParam {String} apikey The user apikey
 *
 * @apiError 401 [401] Unauthorized
 *
 * @apiSuccess token The user token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "e239ue934289eu23hidu2ub",
 *     }
 */
router.post('/apikey', function(req, res, next) {

  console.log(req.body);
  console.log(req.query);

  passport.authenticate('localapikey', function (err, user, info) {
    var error = err || info;

    if (error) {
      return Response.error(res, Response.UNAUTHORIZED, error);
    }
    if (!user) {
      return Response.error(res, Response.AUTHORIZATION);
    }

    var apikey = user.apikey;
    Response.success(res, Response.HTTP_OK, {key: apikey});
  })(req, res, next)
});

module.exports = router;
