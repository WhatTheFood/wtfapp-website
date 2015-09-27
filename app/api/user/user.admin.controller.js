'user strict';

var _ = require('lodash');

var UserModel = require('./user.model');
var RestaurantModel = require('../restaurant/restaurant.model');
var BookingModel = require('./booking.model');
var UserTool = require('./user.tools');

var config = require('../../config/environment');

var Response = require('../../services/response.js');

/**
 * @api {get} /users Get all users
 * @apiName GetAllUsers
 * @apiGroup UserAdmin
 *
 * @apiPermission admin
 *
 * @apiError 500 Unknown error
 *
 * @apiSuccess [User] A list of the users
 *
 */
exports.getUsers = function (req, res) {
  return UserModel.find(function (err, users) {
    if (err) {
      return Response.error(res, Response.UNKNOWN_ERROR, err);
    }
    return Response.success(res, Response.HTTP_OK, users);
  });
};

/**
 * @api {delete} /users/admin/:id Delete a user
 * @apiName DeleteUser
 * @apiGroup UserAdmin
 *
 * @apiPermission admin
 *
 * @apiParam id The user id
 *
 * @apiError 4001 User not found
 *
 * @apiSuccess 204
 *
 */
exports.deleteUser = function (req, res) {
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        return Response.success(res, Response.HTTP_NO_CONTENT);
      }
      else {
        return Response.error(res, Response.USER_NOT_FOUND, err);
      }
    });
  });
};

/**
 * @api {post} /users/admin/:id/role Change the role of the user
 * @apiName DeleteUser
 * @apiGroup UserAdmin
 *
 * @apiPermission admin
 *
 * @apiParam id The user id
 * @apiParam role The new role for the user
 *
 * @apiError 4001 User not found
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "role": [ 'user', 'crous', 'admin' ]
 *     }
 *
 * @apiSuccess 201 User
 *
 */
exports.postRole = function (req, res) {

  if (!req.params.id) {
    return Response.error(res, Response.BAD_REQUEST, "You must provide the id of the user");
  }

  var newRole = req.body.role;
  if (!newRole) {
    return Response.error(res, Response.BAD_REQUEST, "You must provide the new role of the user");
  }

  if (_.indexOf(config.userRoles, newRole) == -1) {
    return Response.error(res, Response.BAD_REQUEST, "Invalid role");
  }

  if (req.params.id == req.user._id) {
    return Response.error(res, Response.BAD_REQUEST, "You can't change your own role");
  }


  return UserModel.findById(req.params.id, function (err, user) {

    if (err) {
      return Response.error(res, Response.BAD_REQUEST, err);
    }

    user.role = newRole;

    user.save(function (err) {
      if (err) {
        return Response.error(res, Response.MONGODB_ERROR, err);
      }

      return Response.success(res, Response.HTTP_OK, user);
    });

  });
};

/**
 * @api {put} /users/:id Update a user
 * @apiName PutUser
 * @apiGroup UserAdmin
 *
 * @apiParam id The user id
 *
 * @apiE
 *
 * @apiError 1001 Bad request
 * @apiError 4001 User not found
 *
 * @apiSuccess User the updated user
 *
 * The put of the user can :
 *
 * - Update user information
 * - Update a preference
 * - Run an action
 *
 */
exports.putUser = function (req, res) {

  if (_.isUndefined(req.params.id)) {
    return Response.error(req, Response.BAD_REQUEST, "id not provide");
  }

  UserModel.findById(req.params.id, function (err, user) {

    if (!user) {
      return Response.error(res, Response.USER_NOT_FOUND);
    }

    if (err) {
      return Response.error(res, Response.USER_NOT_FOUND, err);
    }

    if (req.body.email)
      user.email = req.body.email;

    if (req.body.password) {
      user = UserTool.updateUserPassword(user, req.body.password);
    }

    if (req.body.first_name) {
      user.first_name = req.body.first_name;
    }

    if (req.body.last_name) {
      user.last_name = req.body.last_name;
    }

    // -- We want to update a preference
    if (req.body.preference) {
      user = UserTool.updateUserPreferences(user, req.body.preference);
    }

    // -- We want to run an action
    if (req.body.action) {
      switch (req.body.action) {
        case 'increase_points':
          user = UserTool.updateUserPoints(user);
          user = UserTool.updateActionCount(user, req.body.reason);
          break;
      }
    }

    return user.save(function (err) {
      if (!err) {
        return Response.success(res, Response.HTTP_OK, user);
      }
      else {
        return Response.error(res, Response.USER_NOT_FOUND, err);
      }
    });
  });

};
