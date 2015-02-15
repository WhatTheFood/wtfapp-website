var UserModel = require('../models/user');
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
        'id': user._id
    }

    return infos;
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

exports.updateUserInfosWithFacebook = function(user) {
    if (user.facebook_token) {
        Facebook.updateUserBasicInfos(user);
    }
    return UserTool.getUserBasicInfos(user);
}

exports.getUserFriends = function(user, callback) {

    Facebook.getUserFacebookFriends(user, function(err, friends) {
        var datas = [];
        if (friends && friends !== false) {
            var nb = friends.data.length;
            console.log("NB:", nb);
            friends.data.forEach(function(friend)  {
                UserModel.findOne({ 'facebook_id': friend.id }, function(err, user) {
                    if (user) {
                        datas.push(UserTool.getUserBasicInfos(user));
                        console.log("FOUND: ", datas);
                    }
                    if (--nb == 0) {
                        console.log("END: " + datas);
                        callback(datas);
                    }
                });
            });
        }
    });
}
