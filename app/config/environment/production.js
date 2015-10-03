'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://localhost/wtfapp'
  },
  fb: {
    // TODO: change. Tests
    id: '443745395811172',
    secret: '5562a41fbfad069e13aef46bf5b0d63d',
    callbackUrl: '/auth/facebook/callback',
    scope: [ "profile", "email", "friends" ] // TODO: setup correct values
  }
};
