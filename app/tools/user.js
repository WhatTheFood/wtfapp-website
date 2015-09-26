var UserModel = require('../api/user/user.model');
var Facebook = require('../tools/facebook.js');
var UserTool = require('../tools/user.js');


/*
 * Return the user public infos + facebook informations
 */
exports.getUserBasicInfos = function(user) {
  var infos = {
    'email': user.email,
    'first_name': user.first_name,
    'last_name': user.last_name,
    'avatar': user.avatar,
    'facebook_id': user.facebook_id,
    'booking': user.booking,
    'id': user._id
  };
  return infos;
};

exports.getUserBasicInfosById = function(userId, callback) {
  UserModel.findById(userId, function(err, user) {
    if (user) {
      callback(UserTool.getUserBasicInfos(user));
    }
    else {
      callback(null);
    }
  });
};

exports.updateUserInfosWithFacebook = function(user, callback) {
  if (user.facebook_token) {
    Facebook.updateUserBasicInfos(user, callback);
  }
  else {
    console.log("User does not have facebook token.");
    callback(false, "An error occured");
  }
};

exports.getUserFriends = function(user, callback) {

  Facebook.getUserFacebookFriends(user, function(err, friends) {
    var datas = [];
    if (friends && friends !== false) {
      var nb2 = friends.data.length;
      friends.data.forEach(function(friend)  {
        UserModel.findOne({ 'facebook_id': friend.id }, function(err, user) {
          if (user) {
            datas.push(user);
          }
          if (--nb2 === 0) {
            callback(null, datas);
          }
        });
      });
    }
    else {
      callback([], null);
    }
  });
};
