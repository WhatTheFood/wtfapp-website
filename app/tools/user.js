var UserModel = require('../models/user');
var Facebook = require('../tools/facebook.js');
var UserTool = require('../tools/user.js');

/*
 * Return the user public infos + facebook informations
 */
exports.getUserBasicInfos = function(user) {
    var infos = {
        'email': user.email,
        'name': ""
    }

    /*
     * Call fb api and update infos.
     */
    if (user.facebook_token) {
        var fbInfos = Facebook.getUserBasicInfos(user.facebook_token);
        // TODO update infos
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
