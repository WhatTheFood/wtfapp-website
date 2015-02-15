
var UserModel = require('../models/user');
var tokenManager = require('../config/token_manager');
var TOKEN_EXPIRATION = 60;
var TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;

// Middleware for token verification
exports.verifyToken = function (req, res, next) {
    var token = tokenManager.getToken(req.headers);
    console.log(req.headers)
    if (!token) {
        console.log("Token :(")
        return res.status(503).send("Bad Header");
    }

    UserModel.findOne({token: token }, function (err, user) {

        if (err) {
            console.log(err);
            return res.send(500);
        }

        if (user) {
            next()
        }
        else {
            res.send(403);
        }

    });
};

exports.expireToken = function(headers) {
    var token = getToken(headers);

    if (token != null) {
        UserModel.set(token, { is_expired: true });
        UserModel.expire(token, TOKEN_EXPIRATION_SEC);
    }
};

exports.getToken = function(headers) {
    if (headers && headers.authorization) {
        var authorization = headers.authorization;
        var part = authorization.split(' ');

        if (part.length == 2) {
            var token = part[1];
            return part[1];
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
};

exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;
