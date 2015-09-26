'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });

var Response = require('../services/response.js');

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {

  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }

      if (req.query && req.query.apikey) {
        validateApiKey(req, res, next, req.query.apikey);
      }
      else if (req.headers && req.headers.apikey) {
        validateApiKey(req, res, next, req.headers.apikey);
      }
      else {
        validateJwt(req, res, next);
      }
    })
    // Attach user to request
    .use(function(req, res, next) {

      User.findById(req.user._id, function (err, user) {

        if (err) return next(err);

        if (!user) {
          return Response.error(res, Response.UNAUTHORIZED);
        }

        req.user = user;
        next();
      });
    });
}

function validateApiKey(req, res, next, apikey) {

  if (!apikey) {
    return next(new UnauthorizedError('credentials_required', { message: 'No ApiKey was found' }));
  }

  User.findOne({ apikey: apikey }, function(err, user) {

    if (err) {
      return next(err);
    }

    if (!user) {
      return Response.error(res, Response.INVALID_API_KEY);
    }

    req.user = user;
    next();
  });

}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {

  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      console.log('Role required: ', roleRequired);
      console.log('User have roles : ', req.user.role);
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        return Response.error(res, Response.UNAUTHORIZED);
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return Response.error(res, Response.UNKNOWN_ERROR);
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
