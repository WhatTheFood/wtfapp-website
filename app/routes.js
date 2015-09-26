'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  app.use('/api/users', require('./api/user'));
  app.use('/api/restaurants', require('./api/restaurant'));

  app.use('/api/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  app.route('/privacy')
    .get(function(req, res, next) {
      res.render('privacy');
  });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.render('index', { title: 'What The Food' });
    });
};