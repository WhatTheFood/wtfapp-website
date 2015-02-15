var UserModel = require('../models/user');
var Facebook = require('../tools/facebook.js');
var UserTool = require('../tools/user.js');
var Tools = require('../tools/tools.js');
var BookingModel = require('../models/previsions.js');

/*
 * Return the user public infos + facebook informations
 */
exports.getUserBasicInfos = function(user, callback) {
        var infos = {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': user.avatar,
            'facebook_id': user.facebook_id,
            'booking': user.booking,
            'id': user._id
        }
        callback(infos);
}

exports.getUserBasicInfosById = function(userId) {

    UserModel.findById(userId, function(err, user) {

        if (user) {
            return UserTool.getUserBasicInfos(user);
        }
        else {
            return false;
        }
    });
}

exports.updateUserInfosWithFacebook = function(user, callback) {
    if (user.facebook_token) {
        Facebook.updateUserBasicInfos(user, callback);
    }
    else {
        return UserTool.getUserBasicInfos(user);
    }
}

exports.getUserFriends = function(user, callback) {

    Facebook.getUserFacebookFriends(user, function(err, friends) {
        var datas = [];
        if (friends && friends != false) {
            var nb2 = friends.data.length;
            friends.data.forEach(function(friend)  {
                UserModel.findOne({ 'facebook_id': friend.id }, function(err, user) {
                    if (user) {
                      datas.push(user);
                    }
                    if (--nb2 == 0) {
                        callback(null, datas);
                    }
               });
            });
        }
        else {
            callback([], null);
        }
    });
}
