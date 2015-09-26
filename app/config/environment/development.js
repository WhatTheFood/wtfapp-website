'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/wtfapp'
  },

  seedDB: false,

  fb: {
    id: '443752652477113',
    secret: 'b1a0ecaea0082605ff94fe181805b023',
    callbackUrl: '/auth/facebook/callback',
    scope: [ "profile", "email", "friends" ] // TODO: setup correct values
  }

};
