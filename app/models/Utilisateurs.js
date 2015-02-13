/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Article Schema
 */

var UtilisateursSchema = new Schema({
  email: {type : String, default : '', trim : true},
  password: {type : String, default : '', trim : true},
});

/**
 * Validations
 */

UtilisateursSchema.path('email').required(true, 'User email cannot be blank');
UtilisateursSchema.path('password').required(true, 'User password cannot be blank');

mongoose.model('Utilisateurs', UtilisateursSchema);
