var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var routes = require('./app/routes/index');
var users = require('./app/routes/users');
var restaurants = require('./app/routes/restaurants');

var app = express();

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
}
app.use(allowCrossDomain);

// Use the passport package in our application
app.use(passport.initialize());

// routes
app.use('/', routes);
app.use('/api/users', users);
app.use('/api/restaurants', restaurants);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.send(401, 'invalid token...');
    }
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// database connection
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI + '/wtfapp');

//
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    var restaurants = db.collection('restaurants');
    restaurants.ensureIndex({geolocation: '2dsphere'}, {}, function(err, result) {
        if(err) {
            return console.dir(err);
        }
    });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
