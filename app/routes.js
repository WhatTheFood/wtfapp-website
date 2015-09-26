var express = require('express');
var router = express.Router();

var errors = require('./components/errors');

// TODO:
///* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'What The Food' });
//});
//
///* GET privacy page. */
//router.get('/privacy', function(req, res, next) {
//  res.render('privacy');
//});

module.exports = function(app) {

  app.use('/privacy', function(req, res, next) {
    res.render('privacy');
  });

  app.use('/api/auth', require('./auth'));
  app.use('/api/users', require('./api/user/'));
  app.use('/api/restaurants', require('./api/restaurant/'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.render('index', { title: 'What The Food' });
    });

};