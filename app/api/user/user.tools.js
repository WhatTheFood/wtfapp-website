var _ = require('lodash');

var UserModel = require('./user.model');
var FacebookTools = require('./facebook.tools.js');

var jwt = require('jsonwebtoken');
var secret = require('../../config/secret');

var config = require('../../config/environment');
var Response = require('../../services/response.js');

exports.updateUserInfosWithFacebook = function (user, callback) {
  if (user.fb.access_token) {
    FacebookTools.updateUserBasicInfos(user, callback);
  }
  else {
    console.log("User does not have facebook token.");
    callback(false, "An error occured");
  }
};

exports.getUserFriends = function (user, callback) {

  FacebookTools.getUserFacebookFriendsPromised(user).then(function (friends) {
    var datas = [];

    if (friends.code == 190) {
      return callback(friends, null);
    }

    if (friends && friends !== false) {

      var nb2 = friends.data.length;

      friends.data.forEach(function (friend) {
        console.log(friend.id);
        UserModel.findOne({'fb.id': friend.id}, function (err, user) {

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
      return Response.success(res, Response.HTTP_OK, exports.transformToPrivate(user));
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

  _.forEach(req.body.preferences, function (pref) {
    var key= pref.key,value=pref.value;

    var preference = config.user.preferences_keys[key];

    if (!preference) {
      return Response.error(res, Response.BAD_REQUEST, "Invalid preference key " + key);
    }

    // console.log(key, "/", value, "/", typeof(value));

    // Favorite RU
    if (key == "favoriteRu"){
      user.favoriteRu = parseInt(value,10);
    } else {
      // typeof value is always a string in nodejs...
      if ((preference === "boolean" && value != "true" && value != "false" && value != true && value != false)
        || (preference === "string" && typeof value !== "string")
        || (preference === "object" && typeof value !== "object")) {

        return Response.error(res,
          Response.BAD_REQUEST,
          "Invalid preference value for key " + key + ". Must be a " + preference + " not a " + typeof value);

      }
      else if (preference !== "boolean" && _.isEmpty(value)) {
        return Response.error(res,
          Response.BAD_REQUEST,
          "Invalid preference value for key " + key + ". Must be a " + preference + " not empty");
      }
      preferences[key] = value;
      preferences = _.merge(user.preferences, preferences);
      user.preferences = {};
      user.preferences = preferences;
    }
  });
  user.save(function (err) {
    if (err) {
      return Response.error(res, Response.MONGODB_ERROR, err);
    }
    return Response.success(res, Response.HTTP_OK, exports.transformToPrivate(user));
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
    return Response.success(res, Response.HTTP_OK, exports.transformToPrivate(user));
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
    final.push(user);
  });

  return final;
};


/**
 * Transform a user in db into a not too private user for the net
 * @param users
 * @returns {Array}
 */
exports.transformToPrivate = function (user) {
  var u = JSON.parse(JSON.stringify(user));
  u.hashedPassword= u.provider = u.salt= undefined;
  return u;
};
