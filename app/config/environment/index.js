'use strict';

var path = require('path');
var _ = require('lodash');

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  //seedDB: false,

  // TODO: Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: '188sqw9098w109()@$3842$@@(#":{P}'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'crous', 'admin'],

  user: {
    preferences_keys: [ // The keys that can be used for the user preferences
      'vegetarian',
      'vegan',
      'nopork',
      'noveal',
      'nogluten',
      'nocrustacean',
      'noeggs',
      'nofish',
      'nosoya',
      'nopotato',
      'nomilk',
      'nonut',
      'nopeanut',
      'ru_favori'
    ],

    actions_keys: [
      'increase_points'
    ],

    actions_reasons: [
      'lunch-quizz',
      'queue-status'
    ]
  },

  // Number of points give to a user at an action
  POINTS_PER_ACTION: 5,

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  }

};

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
