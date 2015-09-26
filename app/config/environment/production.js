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
    id: '443752652477113',
    secret: 'b1a0ecaea0082605ff94fe181805b023',
    callbackUrl: '/auth/facebook/callback',
    scope: [ "profile", "email", "friends" ] // TODO: setup correct values
  }
};