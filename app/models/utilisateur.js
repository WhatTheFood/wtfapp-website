/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Article Schema
 */

var UtilisateurSchema = new Schema({
  email: {type : String, default : '', trim : true},
  password: {type : String, default : '', trim : true},
});

/**
 * Validations
 */

UtilisateurSchema.path('email').required(true, 'User email cannot be blank');
UtilisateurSchema.path('password').required(true, 'User password cannot be blank');

mongoose.model('Utilisateur', UtilisateurSchema);
