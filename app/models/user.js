/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

/**
 * Article Schema
 */

var UserSchema = new Schema({
  email: {
    type : String, 
    unique: true,
    trim : true
  },
  password: {
    type : String,
    trim : true
  },
});

UserSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });

/**
 * Validations
 */

UserSchema.path('email').required(true, 'User email cannot be blank')
  .validate(validator.isEmail, 'Invalid email');

UserSchema.path('password').required(true, 'User password cannot be blank')
  .validate(function(v) {
    if (v != "" && !validator.isLength(v, 5, 30))
      this.invalidate('password', 'must be at least 6 characters.');
  }, null);

/**
 * Presave
 */

UserSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

/**
 * Password checking
 */

UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
