/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Article Schema
 */

var UserSchema = new Schema({
  email: {type : String, default : '', trim : true},
  password: {type : String, default : '', trim : true},
});

/**
 * Validations
 */

UserSchema.path('email').required(true, 'User email cannot be blank');
UserSchema.path('password').required(true, 'User password cannot be blank');

UserModel = mongoose.model('User', UserSchema);
