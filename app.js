/**
 * Main application file
 */

'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');

var config = require('./app/config/environment');

var app = express();

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// allow cross domain
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  next();
};
app.use(allowCrossDomain);

// Use the passport package in our application
app.use(passport.initialize());

// routes
require('./app/routes')(app);


// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var db = mongoose.connection;

// production error handler
// no stacktraces leaked to user
if (process.env.NODE_ENV !== 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

module.exports = app;
