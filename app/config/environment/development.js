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
    id: '443745395811172',
    secret: '5562a41fbfad069e13aef46bf5b0d63d',
    callbackUrl: '/auth/facebook/callback',
    scope: [ "profile", "email", "friends" ] // TODO: setup correct values
  }

};
