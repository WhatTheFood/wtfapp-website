/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');

var uniqueValidator = require('mongoose-unique-validator');



// max of 10 attempts, resulting in a 30 minutes lock



var Schema = mongoose.Schema;

/**
 * Article Schema
 */

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  apikey: String,
  fb: {
    id: {
      type: String
    },
    access_token: {
      type: String
    }
  },
  first_name: {
    type: String,
    default: ""
  },
  last_name: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },
  booking: {
    type : Schema.Types.Mixed, default : {}
  },
  preferences: {
    type : Schema.Types.Mixed, default : {}
  },
  queueFeedbacksCount: 0,
  lunchFeedbacksCount: 0,
  points: 0
});

UserSchema.statics.POINTS_PER_ACTION = 5;

UserSchema.plugin(uniqueValidator, {message: 'Error, expected {PATH} to be unique.'});

/**
 * Virtuals
 */

UserSchema.virtual('isLocked').get(function () {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('public_profile')
  .get(function () {
    return {
      '_id': this._id,
      'first_name': this.first_name,
      'last_name': this.last_name,
      'role': this.role,
      'avatar': this.avatar,
      'points': this.points,
      'booking': this.booking
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function (email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function (err, user) {
      if (err) throw err;
      if (user) {
        if (self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else
      next();
  });


/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }

};

module.exports = mongoose.model('User', UserSchema);
