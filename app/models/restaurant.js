/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Restaurant Schema
 */

var RestaurantSchema = new Schema({
    id: {type: Number, default: 0},
    title: {type : String, default: ''},
    lat: {type: Number, default: 0},
    lon: {type: Number, default: 0},
    area: {type: String, default : ''},
    opening: {type: String, default: ''},
    closing: {type: String, default: false},
    type: {type: String, default: ''},
    accessibility: {type: Boolean, default: false},
    wifi: {type: Boolean, default: false},
    shortdesc: {type: String, default: ''},
    description: {type: String, default: ''},
    access: {type: String, default: ''},
    operationalhours: {type: String, default: ''}
});

mongoose.model('Restaurant', RestaurantSchema);