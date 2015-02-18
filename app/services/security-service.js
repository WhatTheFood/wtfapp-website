var request = require('request');

var TokenManager = require('../config/token_manager');
var UserModel = require('../models/user');

exports.getCurrentUser = function(req, res, callback) {
    var token = TokenManager.getToken(req.headers);

    UserModel.findOne({token: token }, function (err, user) {
        if (err) {
            return res.status(503).send(err)
        }
        else if (!user) {
            return res.status(503).send({ 'message': 'Invalid token.' });
        }
        else {
            callback(user);
        }
    });
}

exports.isAuthenticated = function(req, res, callback) {
    var token = TokenManager.getToken(req.headers);

    UserModel.findOne({token: token }, function (err, user) {
        if (err) {
            return res.status(503).send(err)
        }
        else if (!user) {
            callback(false);
        }
        else {
            callback(true);
        }
    });
}

