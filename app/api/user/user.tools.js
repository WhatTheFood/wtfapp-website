var _ = require('lodash');

var UserModel = require('./user.model');
var Facebook = require('./facebook.tools.js');

var config = require('../../config/environment');

var Response = require('../../services/response.js');

exports.updateUserInfosWithFacebook = function (user, callback) {
  if (user.facebook_token) {
    Facebook.updateUserBasicInfos(user, callback);
  }
  else {
    console.log("User does not have facebook token.");
    callback(false, "An error occured");
  }
};

exports.getUserFriends = function (user, callback) {

  Facebook.getUserFacebookFriends(user, function (err, friends) {
    var datas = [];

    if (err) {
      return callback(err, null);
    }

    if (friends && friends !== false) {

      var nb2 = friends.data.length;

      friends.data.forEach(function (friend) {
        UserModel.findOne({'facebook_id': friend.id}, function (err, user) {

          if (user) {
            datas.push(user);
          }
          if (--nb2 === 0) {
            return callback(null, datas);
          }
        });
      });
    }

  });
};

/**
 * This function will update the user.
 */
exports.putUser = function (req, res, user) {

  if (req.body.email) {
    user.email = req.body.email;
  }

  if (req.body.password) {
    user = updateUserPassword(user, req.body.password);
  }

  if (req.body.first_name) {
    user.first_name = req.body.first_name;
  }

  if (req.body.last_name) {
    user.last_name = req.body.last_name;
  }

  return user.save(function (err) {
    if (!err) {
      return Response.success(res, Response.HTTP_OK, user);
    }
    else {
      return Response.error(res, Response.USER_NOT_FOUND, err);
    }

  });

};

/**
 * Update the user preferences. Each preference is a boolean.
 * @param req
 * @param res
 * @param user
 * @returns {*}
 */
exports.updateUserPreferences = function (req, res, user) {

  if (_.isUndefined(req.body.preferences)) {
    return Response.error(res, Response.BAD_REQUEST, "preferences undefined");
  }

  if (!user.preferences) {
    user.preferences = {};
  }

  var preferences = {};

  _.forEach(req.body.preferences, function (value, key) {

    if (_.indexOf(config.user.preferences_keys, key) == -1) {
      return Response.error(res, Response.BAD_REQUEST, "Invalid preference key " + key);
    }

    if (typeof value != 'boolean' && value != 'false' && value != 'true') {
      return Response.error(res,
        Response.BAD_REQUEST,
        "Invalid preference value for key " + key + ". Must be a boolean");
    }
    preferences[key] = value;
  });

  preferences = _.merge(user.preferences, preferences);
  user.preferences = {};
  user.preferences = preferences;

  user.save(function (err) {
    if (err) {
      return Response.error(res, Response.MONGODB_ERROR, err);
    }
    return Response.success(res, Response.HTTP_OK, user);
  });

};

exports.postUserAction = function (req, res, user) {

  if (!req.body.action) {
    return Response.error(res, Response.BAD_REQUEST, "action undefined");
  }

  if (!req.body.reason) {
    return Response.error(res, Response.BAD_REQUEST, "reason undefined");
  }

  if (_.indexOf(config.user.actions_keys, req.body.action) == -1) {
    return Response.error(res, Response.BAD_REQUEST,
      "Invalid action '" + req.body.action + "'. You can use: " + config.user.actions_keys);
  }

  if (_.indexOf(config.user.actions_reasons, req.body.reason) == -1) {
    return Response.error(res, Response.BAD_REQUEST,
      "Invalid reason '" + req.body.reason + "'. You can use: " + config.user.actions_reasons);
  }

  switch (req.body.action) {
    case 'increase_points':
      user = updateUserPoints(user);
      user = updateActionCount(user, req.body.reason);
      break;
  }

  user.save(function (err) {
    if (err) {
      return Response.error(res, Response.MONGODB_ERROR, err);
    }
    return Response.success(res, Response.HTTP_OK, user);
  });

};

exports.updateUserPassword = function (user) {
  if (req.body.password.length > 30) {
    return Response.error(res, Response.INVALID_PASSWORD_CONSTRAINT, err);
  }
  else {
    user.password = req.body.password;
  }
};


// -------

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


/**
 * Transform a user array to an array of public profiles
 * @param users
 * @returns {Array}
 */
exports.transformToPublic = function (users) {

  var final = [];
  _.each(users, function (user) {
    final.push(user.public_profile);
  });

  return final;
};