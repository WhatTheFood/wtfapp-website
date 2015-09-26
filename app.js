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

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Setup server
var app = express();

require('./app/config/express')(app);
require('./app/routes')(app);

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


// Expose app
module.exports = app;
