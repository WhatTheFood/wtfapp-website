var UserModel = require('../api/user/user.model');
var Facebook = require('../tools/facebook.js');

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
